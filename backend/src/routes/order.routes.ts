import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Order } from '../models/Order';
import { Crop } from '../models/Crop';
import { Transaction } from '../models/Transaction';
import { CreditLedger } from '../models/CreditLedger';
import { redisClient } from '../config/redis';

const router = Router();

// Create an order
router.post('/', protect, async (req: any, res) => {
  try {
    const { cropId, quantity } = req.body;
    
    const crop = await Crop.findById(cropId);
    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
    
    if (crop.quantity < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough quantity available' });
    }

    const totalAmount = crop.pricePerUnit * quantity;

    const order = await Order.create({
      buyerId: req.user.id,
      farmerId: crop.farmerId,
      cropId: crop._id,
      quantity,
      totalAmount,
      paymentStatus: 'pending',
      deliveryStatus: 'pending'
    });

    // We do NOT decrement crop quantity here yet, maybe only on payment success. 
    // For MVP, just return the order.
    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// List orders for the user
router.get('/', protect, async (req: any, res) => {
  try {
    const query = req.user.role === 'farmer' ? { farmerId: req.user.id } : { buyerId: req.user.id };
    const orders = await Order.find(query)
      .populate('cropId', 'name category')
      .populate('buyerId', 'name phone location')
      .populate('farmerId', 'name phone location')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Buyer triggers cash payment OTP
router.post('/:id/pay-cash', protect, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `cash_otp_${order._id}`;
    
    // Store in Redis (expires in 15 mins)
    await redisClient.setEx(redisKey, 900, otp);

    // Update order status to pending cash confirmation
    order.paymentStatus = 'pending';
    await order.save();

    // SIMULATE SENDING OTP TO FARMER via SMS/Email
    console.log(`\n\n[MOCK SMS] -> To Farmer: Buyer wants to pay cash for Order ${order._id}. Your OTP to confirm receipt is: ${otp}\n\n`);

    res.json({ success: true, message: 'OTP sent to farmer successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DEBUG ONLY: GET OTP (For E2E Testing)
router.get('/debug/otp/:id', async (req: any, res) => {
  try {
    const redisKey = `cash_otp_${req.params.id}`;
    const otp = await redisClient.get(redisKey);
    res.json({ success: true, otp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Farmer verifies cash payment OTP
router.post('/:id/verify-cash', protect, async (req: any, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const redisKey = `cash_otp_${order._id}`;
    const storedOtp = await redisClient.get(redisKey);

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // OTP matched! Process payment
    order.paymentStatus = 'completed';
    await order.save();

    // Create Transaction
    const transaction = await Transaction.create({
      orderId: order._id,
      payerId: order.buyerId,
      payeeId: order.farmerId,
      amount: order.totalAmount,
      mode: 'cash',
      status: 'success'
    });

    // Update CreditLedger
    let ledger = await CreditLedger.findOne({ farmerId: order.farmerId });
    if (!ledger) {
      ledger = await CreditLedger.create({ farmerId: order.farmerId });
    }

    // [NOTE: MVP PLACEHOLDER]
    // Incrementing trustScore by 50 here is a simplified placeholder MVP value 
    // for the hackathon demo, not a finished credit-scoring algorithmic method.
    ledger.trustScore += 50; 
    ledger.factors.transactionConsistency += 10;
    
    // Add history log
    ledger.history.push({ date: new Date(), score: ledger.trustScore });
    await ledger.save();

    // Clear OTP
    await redisClient.del(redisKey);

    res.json({ success: true, message: 'Payment verified and transaction recorded', data: transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
