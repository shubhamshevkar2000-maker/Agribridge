"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createOrder = void 0;
const payment_service_1 = require("../services/payment.service");
const createOrder = async (req, res) => {
    try {
        const { amount, internalOrderId } = req.body;
        // req.user from auth middleware
        const rzpOrder = await (0, payment_service_1.createRazorpayOrderMock)(internalOrderId, amount);
        res.json({ success: true, data: rzpOrder });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createOrder = createOrder;
const verifyPayment = async (req, res) => {
    try {
        const { rzpOrderId, rzpPaymentId, rzpSignature, amount, relatedOrderId, relatedAuctionId } = req.body;
        const transaction = await (0, payment_service_1.processPaymentMock)(rzpOrderId, rzpPaymentId, rzpSignature, req.user.id, // from auth middleware
        amount, relatedOrderId, relatedAuctionId);
        res.json({ success: true, data: transaction });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.verifyPayment = verifyPayment;
