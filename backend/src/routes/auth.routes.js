"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/signup', auth_controller_1.signup);
router.post('/login', auth_controller_1.login);
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
router.put('/me', auth_middleware_1.protect, auth_controller_1.updateMe);
router.get('/demo-config', (req, res) => {
    res.json({
        success: true,
        farmerEmail: process.env.DEMO_FARMER_EMAIL || 'demo.farmer@agribridge.com',
        buyerEmail: process.env.DEMO_BUYER_EMAIL || 'demo.buyer@agribridge.com'
    });
});
// OTP routes can be added here
router.post('/otp/send', (req, res) => res.json({ success: true, message: 'Mock OTP sent' }));
router.post('/otp/verify', (req, res) => res.json({ success: true, message: 'Mock OTP verified' }));
exports.default = router;
