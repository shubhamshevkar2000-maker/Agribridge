import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { CreditLedger } from '../models/CreditLedger';
import { Order } from '../models/Order';
import { Delivery } from '../models/Delivery';
import { Auction } from '../models/Auction';
import { Loan } from '../models/Loan';

const router = Router();

// Calculate score dynamically based on user's activity
const calculateCreditScore = async (farmerId: string) => {
  // Base score
  let trustScore = 100;
  let creditScore = 300;
  const factors = {
    repaymentHistory: 0,
    transactionConsistency: 0,
    disputeRate: 0,
    incomeStability: 0,
  };

  try {
    // 1. Orders (Volume and Completion)
    const crops = await require('../models/Crop').Crop.find({ farmerId }).distinct('_id');
    const orders = await Order.find({ 'cropId': { $in: crops } });
    
    const completedOrders = orders.filter(o => o.paymentStatus === 'completed' || o.deliveryStatus === 'delivered');
    if (orders.length > 0) {
      factors.transactionConsistency = Math.min((completedOrders.length / orders.length) * 100, 100);
      trustScore += (completedOrders.length * 5); // +5 per completed order
      creditScore += (completedOrders.length * 10);
    }

    // 2. Deliveries (On-time rate)
    const deliveries = await Delivery.find({ 'orderId': { $in: orders.map(o => o._id) } });
    const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
    if (deliveries.length > 0) {
      const onTimeRate = completedDeliveries.length / deliveries.length;
      trustScore += (onTimeRate * 50);
      creditScore += (onTimeRate * 50);
    }

    // 3. Auctions
    const auctions = await Auction.find({ farmerId, status: 'sold' });
    if (auctions.length > 0) {
      trustScore += (auctions.length * 10);
      creditScore += (auctions.length * 20);
      factors.incomeStability = Math.min(auctions.length * 20, 100);
    }

    // 4. Loans (Repayment History)
    const loans = await Loan.find({ farmerId });
    const repaidLoans = loans.filter(l => l.status === 'repaid');
    const defaultedLoans = loans.filter(l => l.status === 'defaulted');
    
    if (loans.length > 0) {
      factors.repaymentHistory = Math.min((repaidLoans.length / loans.length) * 100, 100);
      creditScore += (repaidLoans.length * 50);
      creditScore -= (defaultedLoans.length * 100);
    } else {
      factors.repaymentHistory = 50; // Neutral if no loans
    }

    // Cap scores
    trustScore = Math.min(Math.max(trustScore, 0), 1000);
    creditScore = Math.min(Math.max(creditScore, 300), 900);
    
    // Normalize factors to 0-100
    factors.transactionConsistency = Math.round(factors.transactionConsistency);
    factors.repaymentHistory = Math.round(factors.repaymentHistory);
    factors.disputeRate = 0; // Assuming no disputes for now
    factors.incomeStability = Math.round(factors.incomeStability);

    return { trustScore, creditScore, factors };

  } catch (error) {
    console.error('Error calculating score:', error);
    return { trustScore, creditScore, factors };
  }
};

router.get('/', protect, async (req: any, res) => {
  try {
    const { trustScore, creditScore, factors } = await calculateCreditScore(req.user.id);
    let ledger = await CreditLedger.findOne({ farmerId: req.user.id });
    
    if (!ledger) {
      ledger = await CreditLedger.create({
        farmerId: req.user.id,
        trustScore,
        creditScore,
        factors,
        history: [{ date: new Date(), score: creditScore, reason: 'Initial Calculation' }]
      });
    } else {
      ledger.trustScore = trustScore;
      ledger.creditScore = creditScore;
      ledger.factors = factors;
      await ledger.save();
    }
    res.json({ success: true, data: ledger });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/score', protect, async (req: any, res) => {
  try {
    const { trustScore, creditScore, factors } = await calculateCreditScore(req.user.id);
    let ledger = await CreditLedger.findOne({ farmerId: req.user.id });
    
    if (!ledger) {
      ledger = await CreditLedger.create({
        farmerId: req.user.id,
        trustScore,
        creditScore,
        factors,
        history: [{ date: new Date(), score: creditScore, reason: 'Initial Calculation' }]
      });
    } else {
      ledger.trustScore = trustScore;
      ledger.creditScore = creditScore;
      ledger.factors = factors;
      await ledger.save();
    }
    res.json({ success: true, data: ledger });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
