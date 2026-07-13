import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

export default router;
