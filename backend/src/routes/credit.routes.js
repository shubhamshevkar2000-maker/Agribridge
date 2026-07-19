"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const CreditLedger_1 = require("../models/CreditLedger");
const Order_1 = require("../models/Order");
const Delivery_1 = require("../models/Delivery");
const Auction_1 = require("../models/Auction");
const Loan_1 = require("../models/Loan");
const router = (0, express_1.Router)();
// Calculate score dynamically based on user's activity
const calculateCreditScore = async (farmerId) => {
    // Base score
    let trustScore = 100;
    let creditScore = 300;
    const factors = {
        repaymentHistory: 0,
        transactionConsistency: 0,
        disputeRate: 0,
        incomeStability: 0,
    };
    try {
        // 1. Orders (Volume and Completion)
        const crops = await require('../models/Crop').Crop.find({ farmerId }).distinct('_id');
        const orders = await Order_1.Order.find({ 'cropId': { $in: crops } });
        const completedOrders = orders.filter(o => o.paymentStatus === 'completed' || o.deliveryStatus === 'delivered');
        if (orders.length > 0) {
            factors.transactionConsistency = Math.min((completedOrders.length / orders.length) * 100, 100);
            trustScore += (completedOrders.length * 5); // +5 per completed order
            creditScore += (completedOrders.length * 10);
        }
        // 2. Deliveries (On-time rate)
        const deliveries = await Delivery_1.Delivery.find({ 'orderId': { $in: orders.map(o => o._id) } });
        const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
        if (deliveries.length > 0) {
            const onTimeRate = completedDeliveries.length / deliveries.length;
            trustScore += (onTimeRate * 50);
            creditScore += (onTimeRate * 50);
        }
        // 3. Auctions
        const auctions = await Auction_1.Auction.find({ farmerId, status: 'sold' });
        if (auctions.length > 0) {
            trustScore += (auctions.length * 10);
            creditScore += (auctions.length * 20);
            factors.incomeStability = Math.min(auctions.length * 20, 100);
        }
        // 4. Loans (Repayment History)
        const loans = await Loan_1.Loan.find({ farmerId });
        const repaidLoans = loans.filter(l => l.status === 'repaid');
        const defaultedLoans = loans.filter(l => l.status === 'defaulted');
        if (loans.length > 0) {
            factors.repaymentHistory = Math.min((repaidLoans.length / loans.length) * 100, 100);
            creditScore += (repaidLoans.length * 50);
            creditScore -= (defaultedLoans.length * 100);
        }
        else {
            factors.repaymentHistory = 50; // Neutral if no loans
        }
        // Cap scores
        trustScore = Math.min(Math.max(trustScore, 0), 1000);
        creditScore = Math.min(Math.max(creditScore, 300), 900);
        // Normalize factors to 0-100
        factors.transactionConsistency = Math.round(factors.transactionConsistency);
        factors.repaymentHistory = Math.round(factors.repaymentHistory);
        factors.disputeRate = 0; // Assuming no disputes for now
        factors.incomeStability = Math.round(factors.incomeStability);
        return { trustScore, creditScore, factors };
    }
    catch (error) {
        console.error('Error calculating score:', error);
        return { trustScore, creditScore, factors };
    }
};
router.get('/', auth_middleware_1.protect, async (req, res) => {
    try {
        const { trustScore, creditScore, factors } = await calculateCreditScore(req.user.id);
        let ledger = await CreditLedger_1.CreditLedger.findOne({ farmerId: req.user.id });
        if (!ledger) {
            ledger = await CreditLedger_1.CreditLedger.create({
                farmerId: req.user.id,
                trustScore,
                creditScore,
                factors,
                history: [{ date: new Date(), score: creditScore, reason: 'Initial Calculation' }]
            });
        }
        else {
            ledger.trustScore = trustScore;
            ledger.creditScore = creditScore;
            ledger.factors = factors;
            await ledger.save();
        }
        res.json({ success: true, data: ledger });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/score', auth_middleware_1.protect, async (req, res) => {
    try {
        const { trustScore, creditScore, factors } = await calculateCreditScore(req.user.id);
        let ledger = await CreditLedger_1.CreditLedger.findOne({ farmerId: req.user.id });
        if (!ledger) {
            ledger = await CreditLedger_1.CreditLedger.create({
                farmerId: req.user.id,
                trustScore,
                creditScore,
                factors,
                history: [{ date: new Date(), score: creditScore, reason: 'Initial Calculation' }]
            });
        }
        else {
            ledger.trustScore = trustScore;
            ledger.creditScore = creditScore;
            ledger.factors = factors;
            await ledger.save();
        }
        res.json({ success: true, data: ledger });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
