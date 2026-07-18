import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Order } from '../models/Order';
import { Auction } from '../models/Auction';
import { User } from '../models/User';
import { Loan } from '../models/Loan';
import { Delivery } from '../models/Delivery';

const router = Router();

import { Crop } from '../models/Crop';
import { Notification } from '../models/Notification';
import { Transaction } from '../models/Transaction';

router.get('/farmer', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Fetch Revenue Stats (Today, Monthly, Total)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const orders = await Order.find({ farmerId: userId, paymentStatus: 'completed' }).populate('cropId');
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const monthlyRevenue = orders
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const todayRevenue = orders
      .filter(o => new Date(o.createdAt) >= today)
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // 2. Fetch Inventory Stats
    const crops = await Crop.find({ farmerId: userId, status: 'listed' });
    const totalCrops = crops.length;
    const availableStock = crops.reduce((sum, crop) => sum + (crop.quantity || 0), 0);
    const lowStock = crops.filter(c => c.quantity < 50).length;

    // 3. Fetch Marketplace Stats
    // Assuming active listings = crops
    const activeListings = totalCrops;
    
    // 4. Fetch Auction Stats
    const activeAuctions = await Auction.find({ farmerId: userId, status: 'live' }).populate('cropId').sort({ endTime: 1 });
    
    // 5. Fetch Delivery Stats
    const activeDeliveries = await Delivery.find({ 
      orderId: { $in: orders.map(o => o._id) },
      status: { $in: ['unassigned', 'accepted', 'picked_up', 'in_transit'] } 
    }).populate({ path: 'orderId', populate: { path: 'cropId' } });
    
    const deliveriesCount = {
      pending: activeDeliveries.filter(d => ['unassigned', 'accepted'].includes(d.status)).length,
      pickedUp: activeDeliveries.filter(d => d.status === 'picked_up').length,
      inTransit: activeDeliveries.filter(d => d.status === 'in_transit').length,
      delivered: await Delivery.countDocuments({ 
        orderId: { $in: orders.map(o => o._id) }, 
        status: 'delivered' 
      })
    };

    // 6. Fetch Notifications
    const notifications = await Notification.find({ userId: userId }).sort({ createdAt: -1 }).limit(10);
    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    // 7. Fetch Recent Activity
    const recentActivity = await Transaction.find({ payeeId: userId, status: 'success' })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('payerId', 'name');

    res.json({
      success: true,
      data: {
        farmer: {
          name: user.name,
          village: user.location?.address || 'N/A',
          district: user.location?.city || 'N/A',
          state: user.location?.state || 'N/A',
          profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2ecc71&color=fff`
        },
        walletBalance: user.walletBalance || 0,
        trustScore: user.trustScore || 300,
        creditScore: user.creditScore || 300,
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          today: todayRevenue,
          growth: 12 // Mock growth percentage for demo
        },
        inventory: {
          totalCrops,
          availableStock,
          lowStock,
          soldToday: orders.filter(o => new Date(o.createdAt) >= today).reduce((sum, o) => sum + o.quantity, 0)
        },
        marketplace: {
          activeListings,
          views: activeListings * 142, // Mock views for demo
          interestedBuyers: activeListings * 12,
          averagePrice: crops.length > 0 ? crops.reduce((sum, c) => sum + (c.pricePerUnit || 0), 0) / crops.length : 0
        },
        auctions: {
          count: activeAuctions.length,
          live: activeAuctions
        },
        deliveries: deliveriesCount,
        recentDeliveries: activeDeliveries.slice(0, 5),
        notifications: {
          list: notifications,
          unreadCount: unreadNotifications
        },
        recentOrders: orders.slice(0, 5),
        recentActivity
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
