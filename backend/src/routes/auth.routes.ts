import { Router } from 'express';
import { signup, login, getMe, updateMe, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after an hour.'
  }
});

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

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

export default router;
