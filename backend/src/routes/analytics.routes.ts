import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { getPlatformKPIs } from '../services/analytics.service';

const router = Router();

// We would normally add an `adminOnly` middleware here
router.get('/kpis', protect, async (req, res) => {
  try {
    const data = await getPlatformKPIs();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
