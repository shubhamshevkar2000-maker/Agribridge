import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { getKrishiSathiResponse, getKrishiSathiHistory, generateDashboardInsights } from '../services/ai.service';

const router = Router();

router.post('/chat', protect, async (req: any, res) => {
  try {
    const { prompt, language } = req.body;
    const response = await getKrishiSathiResponse(req.user.id, prompt, language);
    res.json({ success: true, data: { response } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/history', protect, async (req: any, res) => {
  try {
    const history = await getKrishiSathiHistory(req.user.id);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/insights', protect, async (req: any, res) => {
  try {
    const insight = await generateDashboardInsights(req.user.id);
    res.json({ success: true, data: { insight } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
