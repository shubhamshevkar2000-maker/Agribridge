"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Order_1 = require("../models/Order");
const Auction_1 = require("../models/Auction");
const User_1 = require("../models/User");
const Loan_1 = require("../models/Loan");
const Delivery_1 = require("../models/Delivery");
const Crop_1 = require("../models/Crop");
const Notification_1 = require("../models/Notification");
const Transaction_1 = require("../models/Transaction");
const router = (0, express_1.Router)();
// Farmer Dashboard Endpoint
router.get('/farmer', auth_middleware_1.protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // 1. Fetch Revenue Stats (Today, Monthly, Total)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        let orders = [];
        try {
            orders = await Order_1.Order.find({ farmerId: userId, paymentStatus: 'completed' }).populate('cropId');
        }
        catch (e) {
            console.error('Error fetching orders:', e);
        }
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const monthlyRevenue = orders
            .filter(o => new Date(o.createdAt) >= startOfMonth)
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const todayRevenue = orders
            .filter(o => new Date(o.createdAt) >= today)
            .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        // 2. Fetch Inventory Stats
        let allCrops = [];
        try {
            allCrops = await Crop_1.Crop.find({ farmerId: userId });
        }
        catch (e) {
            console.error('Error fetching crops:', e);
        }
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
        let activeAuctions = [];
        try {
            activeAuctions = await Auction_1.Auction.find({ farmerId: userId, status: 'live' }).populate('cropId').sort({ endTime: 1 });
        }
        catch (e) {
            console.error('Error fetching auctions:', e);
        }
        // 5. Fetch Delivery Stats
        let activeDeliveries = [];
        try {
            activeDeliveries = await Delivery_1.Delivery.find({
                orderId: { $in: orders.map(o => o._id) },
                status: { $in: ['pending', 'packed', 'in_transit'] }
            }).populate({ path: 'orderId', populate: { path: 'cropId' } });
        }
        catch (e) {
            console.error('Error fetching active deliveries:', e);
        }
        let deliveredCount = 0;
        try {
            deliveredCount = await Delivery_1.Delivery.countDocuments({
                orderId: { $in: orders.map(o => o._id) },
                status: 'delivered'
            });
        }
        catch (e) {
            console.error('Error counting delivered deliveries:', e);
        }
        const deliveriesCount = {
            pending: activeDeliveries.filter(d => ['pending', 'packed'].includes(d.status)).length,
            inTransit: activeDeliveries.filter(d => d.status === 'in_transit').length,
            delivered: deliveredCount
        };
        // 6. Fetch Notifications
        let notifications = [];
        try {
            notifications = await Notification_1.Notification.find({ userId: userId }).sort({ createdAt: -1 }).limit(10);
        }
        catch (e) {
            console.error('Error fetching notifications:', e);
        }
        const unreadNotifications = notifications.filter(n => !n.isRead).length;
        // 7. Fetch Recent Activity
        let recentActivity = [];
        try {
            recentActivity = await Transaction_1.Transaction.find({ payeeId: userId, status: 'success' })
                .sort({ timestamp: -1 })
                .limit(5)
                .populate('payerId', 'name');
        }
        catch (e) {
            console.error('Error fetching transactions:', e);
        }
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
    }
    catch (error) {
        res.status(200).json({
            success: true,
            data: {
                farmer: {
                    name: 'User',
                    village: 'N/A',
                    district: 'N/A',
                    state: 'N/A',
                    profileImage: 'https://ui-avatars.com/api/?name=User&background=2ecc71&color=fff'
                },
                walletBalance: 0,
                trustScore: 0,
                creditScore: 0,
                revenue: { total: 0, monthly: 0, today: 0 },
                inventory: { totalCrops: 0, availableStock: 0, lowStock: 0, soldToday: 0 },
                myListings: { activeCount: 0, draftCount: 0, soldCount: 0, totalCount: 0 },
                auctions: { count: 0, live: [] },
                deliveries: { pending: 0, inTransit: 0, delivered: 0 },
                recentDeliveries: [],
                notifications: { list: [], unreadCount: 0 },
                recentOrders: [],
                recentActivity: []
            }
        });
    }
});
// Buyer Dashboard Endpoint
router.get('/buyer', auth_middleware_1.protect, async (req, res) => {
    try {
        const userId = req.user.id;
        // 1. Total spent
        let completedOrders = [];
        try {
            completedOrders = await Order_1.Order.find({ buyerId: userId, paymentStatus: 'completed' });
        }
        catch (e) {
            console.error('Error fetching completed orders:', e);
        }
        const totalSpent = completedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        // 2. Active orders count
        let activeOrdersCount = 0;
        try {
            activeOrdersCount = await Order_1.Order.countDocuments({
                buyerId: userId,
                deliveryStatus: { $in: ['pending', 'confirmed', 'picked_up', 'in_transit'] }
            });
        }
        catch (e) {
            console.error('Error counting active orders:', e);
        }
        // 3. Active bids count
        let activeAuctions = [];
        try {
            activeAuctions = await Auction_1.Auction.find({ 'bids.bidderId': userId, status: 'live' });
        }
        catch (e) {
            console.error('Error fetching active auctions:', e);
        }
        // 4. Recent Purchases
        let recentPurchases = [];
        try {
            recentPurchases = await Order_1.Order.find({ buyerId: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('cropId')
                .populate('farmerId', 'name');
        }
        catch (e) {
            console.error('Error fetching recent purchases:', e);
        }
        // 5. Deliveries status
        let deliveries = [];
        try {
            const buyerOrders = await Order_1.Order.find({ buyerId: userId }).select('_id');
            const orderIds = buyerOrders.map(o => o._id);
            deliveries = await Delivery_1.Delivery.find({ orderId: { $in: orderIds } })
                .populate({
                path: 'orderId',
                populate: { path: 'cropId' }
            })
                .sort({ updatedAt: -1 })
                .limit(5);
        }
        catch (e) {
            console.error('Error fetching deliveries:', e);
        }
        // 6. Recommended Crops
        const recommendedCrops = [];
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
    }
    catch (error) {
        res.status(200).json({
            success: true,
            data: {
                totalSpent: 0,
                activeOrdersCount: 0,
                activeBidsCount: 0,
                recentPurchases: [],
                deliveries: [],
                recommendedCrops: []
            }
        });
    }
});
// Logistics Dashboard Endpoint
router.get('/logistics', auth_middleware_1.protect, async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Bank Dashboard Endpoint
router.get('/bank', auth_middleware_1.protect, async (req, res) => {
    try {
        const loans = await Loan_1.Loan.find({ bankId: req.user.id }).populate('farmerId', 'name trustScore');
        const formattedLoans = loans.map((l) => {
            const farmer = l.farmerId || {};
            const score = farmer.trustScore || 300;
            let risk = 'Medium';
            if (score >= 700)
                risk = 'Low';
            else if (score < 400)
                risk = 'High';
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Admin Dashboard Endpoint
router.get('/admin', auth_middleware_1.protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const totalUsers = await User_1.User.countDocuments();
        const farmersCount = await User_1.User.countDocuments({ role: 'farmer' });
        const buyersCount = await User_1.User.countDocuments({ role: 'buyer' });
        const logisticsCount = await User_1.User.countDocuments({ role: 'logistics' });
        const banksCount = await User_1.User.countDocuments({ role: 'bank' });
        const activeAuctions = await Auction_1.Auction.countDocuments({ status: 'live' });
        const completedAuctions = await Auction_1.Auction.countDocuments({ status: 'closed' });
        const activeDeliveries = await Delivery_1.Delivery.countDocuments({ status: { $nin: ['delivered', 'cancelled'] } });
        const activeLoans = await Loan_1.Loan.countDocuments({ status: { $in: ['pending', 'under_review'] } });
        const orders = await Order_1.Order.find({ paymentStatus: 'completed' });
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
        const allUsers = await User_1.User.find();
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
