"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const CreditLedger_1 = require("../models/CreditLedger");
const router = (0, express_1.Router)();
// GET /api/credit
router.get('/', auth_middleware_1.protect, async (req, res) => {
    try {
        let ledger = await CreditLedger_1.CreditLedger.findOne({ farmerId: req.user.id });
        if (!ledger) {
            ledger = await CreditLedger_1.CreditLedger.create({
                farmerId: req.user.id,
                trustScore: 0,
                creditScore: 0,
                factors: {
                    repaymentHistory: 0,
                    transactionConsistency: 0,
                    disputeRate: 0,
                    incomeStability: 0,
                },
                history: []
            });
        }
        res.json({ success: true, data: ledger });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/credit/score
router.get('/score', auth_middleware_1.protect, async (req, res) => {
    try {
        let ledger = await CreditLedger_1.CreditLedger.findOne({ farmerId: req.user.id });
        if (!ledger) {
            ledger = await CreditLedger_1.CreditLedger.create({
                farmerId: req.user.id,
                trustScore: 0,
                creditScore: 0,
                factors: {
                    repaymentHistory: 0,
                    transactionConsistency: 0,
                    disputeRate: 0,
                    incomeStability: 0,
                },
                history: []
            });
        }
        res.json({ success: true, data: ledger });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
