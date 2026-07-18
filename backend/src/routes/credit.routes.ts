import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { CreditLedger } from '../models/CreditLedger';

const router = Router();

// GET /api/credit
router.get('/', protect, async (req: any, res) => {
  try {
    let ledger = await CreditLedger.findOne({ farmerId: req.user.id });
    
    if (!ledger) {
      ledger = await CreditLedger.create({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/credit/score
router.get('/score', protect, async (req: any, res) => {
  try {
    let ledger = await CreditLedger.findOne({ farmerId: req.user.id });
    
    if (!ledger) {
      ledger = await CreditLedger.create({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
