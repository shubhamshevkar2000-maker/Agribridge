import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Order } from '../models/Order';
import { Auction } from '../models/Auction';
import { User } from '../models/User';
import { Loan } from '../models/Loan';
import { Delivery } from '../models/Delivery';

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

router.get('/admin', protect, async (req: any, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const totalUsers = await User.countDocuments();
    const farmersCount = await User.countDocuments({ role: 'farmer' });
    const buyersCount = await User.countDocuments({ role: 'buyer' });
    const logisticsCount = await User.countDocuments({ role: 'logistics' });
    const banksCount = await User.countDocuments({ role: 'bank' });

    const activeAuctions = await Auction.countDocuments({ status: 'live' });
    const completedAuctions = await Auction.countDocuments({ status: 'closed' });

    const activeDeliveries = await Delivery.countDocuments({ status: { $nin: ['delivered', 'cancelled'] } });
    const activeLoans = await Loan.countDocuments({ status: { $in: ['pending', 'under_review'] } });

    const orders = await Order.find({ paymentStatus: 'completed' });
    const totalGmv = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const platformRevenue = totalGmv * 0.01;

    // Group monthly GMV and Revenue for the current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStatsMap = new Map();
    months.forEach(m => monthlyStatsMap.set(m, { name: m, GMV: 0, Revenue: 0, Users: 0 }));

    orders.forEach(o => {
      const date = new Date(o.createdAt);
      if (date.getFullYear() === new Date().getFullYear()) {
        const monthName = months[date.getMonth()];
        const stat = monthlyStatsMap.get(monthName);
        if (stat) {
          stat.GMV += o.totalAmount;
          stat.Revenue += o.totalAmount * 0.01;
        }
      }
    });

    // Group monthly users
    const allUsers = await User.find();
    allUsers.forEach(u => {
      const date = new Date(u.createdAt || Date.now());
      if (date.getFullYear() === new Date().getFullYear()) {
        const monthName = months[date.getMonth()];
        const stat = monthlyStatsMap.get(monthName);
        if (stat) {
          stat.Users += 1;
        }
      }
    });

    const monthlyStats = Array.from(monthlyStatsMap.values());

    res.json({
      success: true,
      data: {
        totalGmv,
        platformRevenue,
        activeUsersCount: totalUsers,
        farmersCount,
        buyersCount,
        logisticsCount,
        banksCount,
        activeAuctions,
        completedAuctions,
        activeDeliveries,
        activeLoans,
        activeDisputes: 0,
        monthlyStats
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
