"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPaymentMock = exports.createRazorpayOrderMock = void 0;
const Transaction_1 = require("../models/Transaction");
const Order_1 = require("../models/Order");
const notification_service_1 = require("./notification.service");
const crypto_1 = __importDefault(require("crypto"));
const createRazorpayOrderMock = async (orderId, amount) => {
    // Mock Razorpay order creation
    const rzpOrderId = `order_${crypto_1.default.randomBytes(8).toString('hex')}`;
    return {
        id: rzpOrderId,
        entity: 'order',
        amount: amount * 100, // Razorpay takes paise
        currency: 'INR',
        receipt: orderId,
        status: 'created',
    };
};
exports.createRazorpayOrderMock = createRazorpayOrderMock;
const processPaymentMock = async (rzpOrderId, rzpPaymentId, rzpSignature, userId, amount, relatedOrderId, relatedAuctionId) => {
    // In real implementation, verify signature:
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(order_id + '|' + payment_id).digest('hex');
    // if (expectedSignature !== rzpSignature) throw Error;
    const transaction = await Transaction_1.Transaction.create({
        payerId: userId,
        payeeId: userId,
        amount: amount,
        mode: 'upi',
        status: 'success',
        orderId: relatedOrderId
    });
    if (relatedOrderId) {
        await Order_1.Order.findByIdAndUpdate(relatedOrderId, { paymentStatus: 'completed' });
    }
    // Notify user of successful payment
    await (0, notification_service_1.createNotification)({
        userId,
        type: 'payment_success',
        title: 'Payment Successful',
        message: `Your payment of ₹${amount} was successfully processed via UPI. Txn ID: ${rzpPaymentId}`,
    });
    return transaction;
};
exports.processPaymentMock = processPaymentMock;
