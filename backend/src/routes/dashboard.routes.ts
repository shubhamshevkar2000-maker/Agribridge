import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Order } from '../models/Order';
import { Auction } from '../models/Auction';
import { User } from '../models/User';
import { Loan } from '../models/Loan';

const router = Router();

router.get('/farmer', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch real data from MongoDB for this specific user
    const orders = await Order.find({ farmerId: userId, paymentStatus: 'completed' });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const activeAuctions = await Auction.find({ farmerId: userId, status: 'live' });
    
    const user = await User.findById(userId);
    
    res.json({
      success: true,
      data: {
        revenue: totalRevenue,
        activeAuctionsCount: activeAuctions.length,
        trustScore: user?.trustScore || 300, // Base score
        creditScore: user?.creditScore || 300,
        liveAuctions: activeAuctions
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/buyer', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const orders = await Order.find({ buyerId: userId });
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const activeAuctions = await Auction.find({ 'bids.bidderId': userId, status: 'live' });
    
    res.json({
      success: true,
      data: {
        totalSpent,
        activeBidsCount: activeAuctions.length,
        recentOrders: orders.slice(0, 5)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/logistics', protect, async (req: any, res) => {
  try {
    // We would normally filter by logistics provider ID here
    res.json({
      success: true,
      data: {
        activeDeliveries: 0,
        completedDeliveries: 0,
        earnings: 0,
        recentDeliveries: []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/bank', protect, async (req: any, res) => {
  try {
    const loans = await Loan.find({ bankId: req.user.id });
    
    res.json({
      success: true,
      data: {
        activeLoansCount: loans.filter(l => l.status === 'disbursed').length,
        pendingApplicationsCount: loans.filter(l => l.status === 'pending').length,
        totalDisbursed: loans.filter(l => l.status === 'disbursed').reduce((sum, l) => sum + (l.amountApproved || l.amountRequested || 0), 0),
        recentApplications: loans.filter(l => l.status === 'pending').slice(0, 5)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
