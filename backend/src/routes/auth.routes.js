"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const forgotPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset requests. Please try again after an hour.'
    }
});
const router = (0, express_1.Router)();
router.post('/signup', auth_controller_1.signup);
router.post('/login', auth_controller_1.login);
router.post('/forgot-password', forgotPasswordLimiter, auth_controller_1.forgotPassword);
router.post('/reset-password', auth_controller_1.resetPassword);
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
