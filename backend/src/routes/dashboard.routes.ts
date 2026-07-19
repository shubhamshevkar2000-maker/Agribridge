import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Order } from '../models/Order';
import { Auction } from '../models/Auction';
import { User } from '../models/User';
import { Loan } from '../models/Loan';
import { Delivery } from '../models/Delivery';
import { Crop } from '../models/Crop';
import { Notification } from '../models/Notification';
import { Transaction } from '../models/Transaction';

const router = Router();

// Farmer Dashboard Endpoint
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
    const allCrops = await Crop.find({ farmerId: userId });
    const totalCrops = allCrops.length;
    const availableStock = allCrops
      .filter(c => ['draft', 'listed'].includes(c.status))
      .reduce((sum, crop) => sum + (crop.quantity || 0), 0);
    const lowStock = allCrops.filter(c => ['draft', 'listed'].includes(c.status) && c.quantity < 50).length;

    // 3. Fetch Listings Stats
    const activeListings = allCrops.filter(c => c.status === 'listed').length;
    const draftListings = allCrops.filter(c => c.status === 'draft').length;
    const soldListings = allCrops.filter(c => c.status === 'sold').length;

    // 4. Fetch Auction Stats
    const activeAuctions = await Auction.find({ farmerId: userId, status: 'live' }).populate('cropId').sort({ endTime: 1 });
    
    // 5. Fetch Delivery Stats
    const activeDeliveries = await Delivery.find({ 
      orderId: { $in: orders.map(o => o._id) },
      status: { $in: ['pending', 'packed', 'in_transit'] } 
    }).populate({ path: 'orderId', populate: { path: 'cropId' } });
    
    const deliveriesCount = {
      pending: activeDeliveries.filter(d => ['pending', 'packed'].includes(d.status)).length,
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
        trustScore: user.trustScore || 0,
        creditScore: user.creditScore || 0,
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          today: todayRevenue
        },
        inventory: {
          totalCrops,
          availableStock,
          lowStock,
          soldToday: orders.filter(o => new Date(o.createdAt) >= today).reduce((sum, o) => sum + o.quantity, 0)
        },
        myListings: {
          activeCount: activeListings,
          draftCount: draftListings,
          soldCount: soldListings,
          totalCount: totalCrops
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

// Buyer Dashboard Endpoint
router.get('/buyer', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Total spent
    const completedOrders = await Order.find({ buyerId: userId, paymentStatus: 'completed' });
    const totalSpent = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // 2. Active orders count
    const activeOrdersCount = await Order.countDocuments({ 
      buyerId: userId, 
      deliveryStatus: { $in: ['pending', 'confirmed', 'picked_up', 'in_transit'] } 
    });

    // 3. Active bids count
    const activeAuctions = await Auction.find({ 'bids.bidderId': userId, status: 'live' });

    // 4. Recent Purchases
    const recentPurchases = await Order.find({ buyerId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('cropId')
      .populate('farmerId', 'name');

    // 5. Deliveries status
    const buyerOrders = await Order.find({ buyerId: userId }).select('_id');
    const orderIds = buyerOrders.map(o => o._id);
    const deliveries = await Delivery.find({ orderId: { $in: orderIds } })
      .populate({
        path: 'orderId',
        populate: { path: 'cropId' }
      })
      .sort({ updatedAt: -1 })
      .limit(5);

    // 6. Recommended Crops (Return empty array since personalized recommendation logic is not available yet)
    const recommendedCrops: any[] = [];

    res.json({
      success: true,
      data: {
        totalSpent,
        activeOrdersCount,
        activeBidsCount: activeAuctions.length,
        recentPurchases,
        deliveries,
        recommendedCrops
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Logistics Dashboard Endpoint
router.get('/logistics', protect, async (req: any, res) => {
  try {
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

// Bank Dashboard Endpoint
router.get('/bank', protect, async (req: any, res) => {
  try {
    const loans = await Loan.find({ bankId: req.user.id }).populate('farmerId', 'name trustScore');
    
    const formattedLoans = loans.map((l: any) => {
      const farmer = l.farmerId || {};
      const score = farmer.trustScore || 300;
      let risk = 'Medium';
      if (score >= 700) risk = 'Low';
      else if (score < 400) risk = 'High';

      return {
        _id: l._id,
        farmer: farmer.name || 'Unknown',
        farmerId: farmer._id,
        amount: l.amountRequested,
        purpose: 'Agricultural', // Default since not in model
        score: score,
        risk: risk,
        status: l.status,
        createdAt: l.createdAt
      };
    });

    const activeLoans = formattedLoans.filter(l => l.status === 'disbursed' || l.status === 'approved');
    const pendingApps = formattedLoans.filter(l => l.status === 'pending');

    res.json({
      success: true,
      data: {
        activeLoansCount: activeLoans.length,
        pendingApplicationsCount: pendingApps.length,
        totalDisbursed: activeLoans.reduce((sum, l) => sum + l.amount, 0),
        recentApplications: pendingApps.slice(0, 5)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Dashboard Endpoint
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
