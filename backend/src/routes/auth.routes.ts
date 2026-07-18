import { Router } from 'express';
import { signup, login, getMe, updateMe } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
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
