"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformKPIs = void 0;
const Transaction_1 = require("../models/Transaction");
const User_1 = require("../models/User");
const Auction_1 = require("../models/Auction");
const getPlatformKPIs = async () => {
    // In a real application, these would be robust MongoDB aggregation pipelines.
    // For this MVP, we will count totals and mock the time-series data.
    const totalUsers = await User_1.User.countDocuments();
    const totalAuctions = await Auction_1.Auction.countDocuments();
    const transactions = await Transaction_1.Transaction.find({ status: 'success' });
    const gmv = transactions.reduce((acc, txn) => acc + txn.amount, 0);
    // Mock time-series data for the chart
    const revenueData = [
        { name: 'Jan', GMV: 4000, Revenue: 240 },
        { name: 'Feb', GMV: 3000, Revenue: 139 },
        { name: 'Mar', GMV: 2000, Revenue: 980 },
        { name: 'Apr', GMV: 2780, Revenue: 390 },
        { name: 'May', GMV: 1890, Revenue: 480 },
        { name: 'Jun', GMV: 2390, Revenue: 380 },
        { name: 'Jul', GMV: 3490, Revenue: 430 },
    ];
    return {
        kpis: {
            totalUsers: totalUsers || 1420, // Fallbacks for empty DB
            totalAuctions: totalAuctions || 340,
            totalGMV: gmv || 12500000, // ₹1.25 Cr
            platformRevenue: (gmv || 12500000) * 0.01 // 1% take rate
        },
        charts: {
            revenue: revenueData
        }
    };
};
exports.getPlatformKPIs = getPlatformKPIs;
