import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { CreditLedger } from '../models/CreditLedger';

const router = Router();

// GET /api/credit/score
router.get('/score', protect, async (req: any, res) => {
  try {
    let ledger = await CreditLedger.findOne({ farmerId: req.user.id });
    
    // Auto-generate if doesn't exist for demo purposes
    if (!ledger) {
      ledger = await CreditLedger.create({
        farmerId: req.user.id,
        trustScore: 750,
        creditScore: 700,
        factors: {
          repaymentHistory: 85,
          transactionConsistency: 70,
          disputeRate: 5,
          incomeStability: 60,
        },
        history: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 680 },
          { date: new Date(), score: 700 }
        ]
      });
    }

    res.json({ success: true, data: ledger });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
