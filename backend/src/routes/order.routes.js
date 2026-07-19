"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Order_1 = require("../models/Order");
const Crop_1 = require("../models/Crop");
const Transaction_1 = require("../models/Transaction");
const CreditLedger_1 = require("../models/CreditLedger");
const User_1 = require("../models/User");
const redis_1 = require("../config/redis");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
// Create an order
router.post('/', auth_middleware_1.protect, async (req, res) => {
    try {
        const { cropId, quantity } = req.body;
        const crop = await Crop_1.Crop.findById(cropId);
        if (!crop)
            return res.status(404).json({ success: false, message: 'Crop not found' });
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
        const order = await Order_1.Order.create({
            buyerId: req.user.id,
            farmerId: crop.farmerId,
            cropId: crop._id,
            quantity,
            totalAmount,
            paymentStatus: 'pending',
            deliveryStatus: 'pending'
        });
        // Retrieve buyer for location
        const buyer = await User_1.User.findById(req.user.id);
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
            await (0, notification_service_1.createNotification)({
                userId: crop.farmerId,
                type: 'order',
                title: 'New Order Received!',
                message: `You have received a new order for ${quantity} of ${crop.name}.`
            });
        }
        catch (e) {
            console.error(e);
        }
        res.status(201).json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// List orders for the user
router.get('/', auth_middleware_1.protect, async (req, res) => {
    try {
        const query = req.user.role === 'farmer' ? { farmerId: req.user.id } : { buyerId: req.user.id };
        const orders = await Order_1.Order.find(query)
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
            orderObj.delivery = delivery;
            return orderObj;
        }));
        res.json({ success: true, data: ordersWithDelivery });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Buyer triggers cash payment OTP
router.post('/:id/pay-cash', auth_middleware_1.protect, async (req, res) => {
    try {
        const order = await Order_1.Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.buyerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const redisKey = `cash_otp_${order._id}`;
        // Store in Redis (expires in 15 mins)
        await redis_1.redisClient.setEx(redisKey, 900, otp);
        // Update order status to pending cash confirmation
        order.paymentStatus = 'pending';
        await order.save();
        // SIMULATE SENDING OTP TO FARMER via SMS/Email
        console.log(`\n\n[MOCK SMS] -> To Farmer: Buyer wants to pay cash for Order ${order._id}. Your OTP to confirm receipt is: ${otp}\n\n`);
        res.json({ success: true, message: 'OTP sent to farmer successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// DEBUG ONLY: GET OTP (For E2E Testing)
router.get('/debug/otp/:id', async (req, res) => {
    try {
        const redisKey = `cash_otp_${req.params.id}`;
        const otp = await redis_1.redisClient.get(redisKey);
        res.json({ success: true, otp });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Farmer verifies cash payment OTP
router.post('/:id/verify-cash', auth_middleware_1.protect, async (req, res) => {
    try {
        const { otp } = req.body;
        const order = await Order_1.Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.farmerId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        const redisKey = `cash_otp_${order._id}`;
        const storedOtp = await redis_1.redisClient.get(redisKey);
        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        // OTP matched! Process payment
        order.paymentStatus = 'completed';
        await order.save();
        // Create Transaction
        const transaction = await Transaction_1.Transaction.create({
            orderId: order._id,
            payerId: order.buyerId,
            payeeId: order.farmerId,
            amount: order.totalAmount,
            mode: 'cash',
            status: 'success'
        });
        // Update CreditLedger
        let ledger = await CreditLedger_1.CreditLedger.findOne({ farmerId: order.farmerId });
        if (!ledger) {
            ledger = await CreditLedger_1.CreditLedger.create({ farmerId: order.farmerId });
        }
        ledger.trustScore += 50;
        ledger.factors.transactionConsistency += 10;
        // Add history log
        ledger.history.push({ date: new Date(), score: ledger.trustScore });
        await ledger.save();
        // Synchronize trustScore to User model
        await User_1.User.findByIdAndUpdate(order.farmerId, { trustScore: ledger.trustScore });
        // Clear OTP
        await redis_1.redisClient.del(redisKey);
        res.json({ success: true, message: 'Payment verified and transaction recorded', data: transaction });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/orders/:id - Fetch single order details
router.get('/:id', auth_middleware_1.protect, async (req, res) => {
    try {
        const order = await Order_1.Order.findById(req.params.id)
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
        orderObj.delivery = delivery;
        res.json({ success: true, data: orderObj });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', auth_middleware_1.protect, async (req, res) => {
    try {
        const order = await Order_1.Order.findById(req.params.id);
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
        const crop = await Crop_1.Crop.findById(order.cropId);
        if (crop) {
            crop.quantity += order.quantity;
            if (crop.status === 'sold' || crop.status === 'in_auction') {
                crop.status = 'listed';
            }
            await crop.save();
        }
        res.json({ success: true, message: 'Order cancelled successfully', data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
