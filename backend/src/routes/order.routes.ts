import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Order } from '../models/Order';
import { Crop } from '../models/Crop';
import { Transaction } from '../models/Transaction';
import { CreditLedger } from '../models/CreditLedger';
import { User } from '../models/User';
import { redisClient } from '../config/redis';
import { createNotification } from '../services/notification.service';

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

    // Decrement crop inventory
    crop.quantity -= quantity;
    if (crop.quantity <= 0) {
      crop.status = 'sold';
    }
    await crop.save();

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

    // Retrieve buyer for location
    const buyer = await User.findById(req.user.id);
    const dropLocation = buyer?.location || { type: 'Point', coordinates: [0, 0] };
    const pickupLocation = crop.location || { type: 'Point', coordinates: [0, 0] };

    // Automatically create Delivery record
    const { Delivery } = require('../models/Delivery');
    await Delivery.create({
      orderId: order._id,
      pickupLocation,
      dropLocation,
      status: 'pending'
    });

    try {
      await createNotification({ 
        userId: crop.farmerId, 
        type: 'order', 
        title: 'New Order Received!', 
        message: `You have received a new order for ${quantity} of ${crop.name}.` 
      });
    } catch (e) { console.error(e); }

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
      .populate('cropId')
      .populate('buyerId', 'name phone location')
      .populate('farmerId', 'name phone location')
      .sort({ createdAt: -1 });

    const { Delivery } = require('../models/Delivery');
    
    // Find delivery status for each order
    const ordersWithDelivery = await Promise.all(orders.map(async (order) => {
      const delivery = await Delivery.findOne({ orderId: order._id })
        .populate('logisticsPartnerId', 'name phone')
        .populate('driverId', 'name phone');
      
      const orderObj = order.toObject();
      (orderObj as any).delivery = delivery;
      return orderObj;
    }));
    
    res.json({ success: true, data: ordersWithDelivery });
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

    ledger.trustScore += 50; 
    ledger.factors.transactionConsistency += 10;
    
    // Add history log
    ledger.history.push({ date: new Date(), score: ledger.trustScore });
    await ledger.save();

    // Synchronize trustScore to User model
    await User.findByIdAndUpdate(order.farmerId, { trustScore: ledger.trustScore });

    // Clear OTP
    await redisClient.del(redisKey);

    res.json({ success: true, message: 'Payment verified and transaction recorded', data: transaction });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id - Fetch single order details
router.get('/:id', protect, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('cropId')
      .populate('buyerId', 'name phone location email')
      .populate('farmerId', 'name phone location email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.buyerId._id.toString() !== req.user.id && order.farmerId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { Delivery } = require('../models/Delivery');
    const delivery = await Delivery.findOne({ orderId: order._id })
      .populate('logisticsPartnerId', 'name phone')
      .populate('driverId', 'name phone');

    const orderObj = order.toObject();
    (orderObj as any).delivery = delivery;

    res.json({ success: true, data: orderObj });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', protect, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const cannotCancel = ['picked_up', 'in_transit', 'delivered', 'cancelled'].includes(order.deliveryStatus);
    if (cannotCancel) {
      return res.status(400).json({ success: false, message: 'Order has already shipped or been processed' });
    }

    const { Delivery } = require('../models/Delivery');
    const delivery = await Delivery.findOne({ orderId: order._id });
    if (delivery && ['picked_up', 'in_transit', 'delivered', 'cancelled'].includes(delivery.status)) {
      return res.status(400).json({ success: false, message: 'Order has already been shipped' });
    }

    order.deliveryStatus = 'cancelled';
    order.paymentStatus = 'refunded';
    await order.save();

    if (delivery) {
      delivery.status = 'cancelled';
      await delivery.save();
    }

    // Release inventory
    const crop = await Crop.findById(order.cropId);
    if (crop) {
      crop.quantity += order.quantity;
      if (crop.status === 'sold' || crop.status === 'in_auction') {
        crop.status = 'listed';
      }
      await crop.save();
    }

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/:id/accept - Farmer accepts the order
router.post('/:id/accept', protect, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (order.deliveryStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order is not in pending state' });
    }

    order.deliveryStatus = 'confirmed';
    await order.save();

    try {
      await createNotification({
        userId: order.buyerId,
        type: 'order',
        title: 'Order Accepted!',
        message: `Your order for ${order.quantity} of crop has been accepted by the farmer.`
      });
    } catch (e) { console.error(e); }

    res.json({ success: true, message: 'Order accepted successfully', data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/:id/reject - Farmer rejects the order
router.post('/:id/reject', protect, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (order.deliveryStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Order is not in pending state' });
    }

    order.deliveryStatus = 'cancelled';
    order.paymentStatus = 'refunded';
    await order.save();

    const { Delivery } = require('../models/Delivery');
    const delivery = await Delivery.findOne({ orderId: order._id });
    if (delivery) {
      delivery.status = 'cancelled';
      await delivery.save();
    }

    // Release inventory
    const crop = await Crop.findById(order.cropId);
    if (crop) {
      crop.quantity += order.quantity;
      if (crop.status === 'sold' || crop.status === 'in_auction') {
        crop.status = 'listed';
      }
      await crop.save();
    }

    try {
      await createNotification({
        userId: order.buyerId,
        type: 'order',
        title: 'Order Rejected',
        message: `Your order has been rejected by the farmer.`
      });
    } catch (e) { console.error(e); }

    res.json({ success: true, message: 'Order rejected successfully', data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/:id/ready - Farmer marks ready for pickup
router.post('/:id/ready', protect, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    if (order.deliveryStatus !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Order is not accepted/confirmed yet' });
    }

    const { Delivery } = require('../models/Delivery');
    const delivery = await Delivery.findOne({ orderId: order._id });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery record not found' });

    // Transition to Pickup Scheduled (order.deliveryStatus = picked_up, delivery.status = packed)
    order.deliveryStatus = 'picked_up';
    await order.save();

    delivery.status = 'packed';
    // Assign a mock logistics partner and driver
    const logisticsPartners = await User.find({ role: 'logistics' });
    if (logisticsPartners.length > 0) {
      delivery.logisticsPartnerId = logisticsPartners[0]._id;
    } else {
      const anyUser = await User.findOne();
      if (anyUser) delivery.logisticsPartnerId = anyUser._id;
    }
    
    const drivers = await User.find({ role: 'logistics' });
    if (drivers.length > 0) {
      delivery.driverId = drivers[0]._id;
    } else {
      const anyUser = await User.findOne();
      if (anyUser) delivery.driverId = anyUser._id;
    }
    
    await delivery.save();

    try {
      await createNotification({
        userId: order.buyerId,
        type: 'order',
        title: 'Order Ready for Pickup',
        message: `Farmer has packed the order. Logistics partner is scheduled for pickup.`
      });
    } catch (e) { console.error(e); }

    res.json({ success: true, message: 'Order marked ready for pickup', data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/:id/dispatch - Simulate logistics dispatch to transit
router.post('/:id/dispatch', protect, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    const { Delivery } = require('../models/Delivery');
    const delivery = await Delivery.findOne({ orderId: order._id });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery record not found' });

    order.deliveryStatus = 'in_transit';
    await order.save();

    delivery.status = 'in_transit';
    await delivery.save();

    res.json({ success: true, message: 'Logistics pickup simulated successfully. Order is in transit.', data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/:id/out-for-delivery - Mark out for delivery and generate payment OTP
router.post('/:id/out-for-delivery', protect, async (req: any, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.farmerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { Delivery } = require('../models/Delivery');
    const delivery = await Delivery.findOne({ orderId: order._id });
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery record not found' });

    delivery.isOutForDelivery = true;
    await delivery.save();

    // Generate 6 digit OTP for delivery verification/cash payment receipt
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `cash_otp_${order._id}`;
    await redisClient.setEx(redisKey, 900, otp);

    console.log(`\n\n[MOCK SMS] -> To Farmer: Driver is out for delivery. Your OTP to verify receipt and complete delivery is: ${otp}\n\n`);

    res.json({ success: true, message: 'Delivery is out. OTP generated successfully.', otp });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
