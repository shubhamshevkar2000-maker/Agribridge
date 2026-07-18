"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Loan_1 = require("../models/Loan");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
const applyLoanSchema = zod_1.z.object({
    bankId: zod_1.z.string().optional(),
    amountRequested: zod_1.z.number().positive(),
    tenure: zod_1.z.number().positive(),
});
// POST /api/loans/apply
router.post('/apply', auth_middleware_1.protect, async (req, res) => {
    try {
        const validatedData = applyLoanSchema.parse(req.body);
        // Find a default bank if none provided
        let bankId = validatedData.bankId;
        if (!bankId) {
            const bank = await User_1.User.findOne({ role: 'bank' });
            if (!bank) {
                return res.status(400).json({ success: false, message: 'No banks available in the system' });
            }
            bankId = bank._id.toString();
        }
        const loan = await Loan_1.Loan.create({
            farmerId: req.user.id,
            bankId,
            amountRequested: validatedData.amountRequested,
            tenure: validatedData.tenure,
            status: 'pending'
        });
        res.status(201).json({ success: true, data: loan });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ success: false, errors: error.errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/loans
router.get('/', auth_middleware_1.protect, async (req, res) => {
    try {
        // If bank, fetch all loans assigned to them. If farmer, fetch their applied loans.
        const query = req.user.role === 'bank' ? { bankId: req.user.id } : { farmerId: req.user.id };
        const loans = await Loan_1.Loan.find(query)
            .populate('farmerId', 'name email phone location')
            .populate('bankId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: loans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// PUT /api/loans/:id
router.put('/:id', auth_middleware_1.protect, async (req, res) => {
    try {
        const { status, amountApproved } = req.body;
        if (req.user.role !== 'bank') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const loan = await Loan_1.Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ success: false, message: 'Loan not found' });
        }
        if (loan.bankId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        if (status) {
            loan.status = status;
        }
        if (amountApproved !== undefined) {
            loan.amountApproved = amountApproved;
        }
        else if (status === 'approved' && !loan.amountApproved) {
            loan.amountApproved = loan.amountRequested;
        }
        await loan.save();
        res.json({ success: true, data: loan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
