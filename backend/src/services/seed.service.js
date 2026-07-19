"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDashboardData = exports.clearDemoData = exports.seedDemoData = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const Crop_1 = require("../models/Crop");
const Auction_1 = require("../models/Auction");
const Order_1 = require("../models/Order");
const Delivery_1 = require("../models/Delivery");
const Notification_1 = require("../models/Notification");
const Transaction_1 = require("../models/Transaction");
const Loan_1 = require("../models/Loan");
const Wishlist_1 = require("../models/Wishlist");
const redis_1 = require("../config/redis");
const farmerEmail = process.env.DEMO_FARMER_EMAIL || 'demo.farmer@agribridge.com';
const buyerEmail = process.env.DEMO_BUYER_EMAIL || 'demo.buyer@agribridge.com';
const logisticsEmail = process.env.DEMO_LOGISTICS_EMAIL || 'logistics_seed@example.com';
const bankEmail = 'bank_seed@example.com';
const seedDemoData = async () => {
    console.log('Seeding demo data (idempotent checks)...');
    // 1. Create Users if they don't exist
    const passwordHash = await bcrypt_1.default.hash('Demo@123', 10);
    let farmer = await User_1.User.findOne({ email: farmerEmail });
    if (!farmer) {
        farmer = await User_1.User.create({
            name: 'Ramesh Kumar',
            email: farmerEmail,
            phone: '1234500001',
            passwordHash,
            role: 'farmer',
            location: {
                type: 'Point',
                coordinates: [73.8567, 18.5204],
                address: 'Farm Plot 42',
                city: 'Pune',
                state: 'Maharashtra',
                zipCode: '411001'
            },
            trustScore: 850,
            creditScore: 780,
            walletBalance: 125000,
            isDemoAccount: true
        });
        console.log('Demo Farmer created.');
    }
    else {
        console.log('Demo Farmer already exists.');
    }
    let buyer = await User_1.User.findOne({ email: buyerEmail });
    if (!buyer) {
        buyer = await User_1.User.create({
            name: 'FreshMart Ltd',
            email: buyerEmail,
            phone: '1234500002',
            passwordHash,
            role: 'buyer',
            walletBalance: 500000,
            isDemoAccount: true
        });
        console.log('Demo Buyer created.');
    }
    else {
        console.log('Demo Buyer already exists.');
    }
    let logistics = await User_1.User.findOne({ email: logisticsEmail });
    if (!logistics) {
        logistics = await User_1.User.create({
            name: 'AgriTrans Logistics',
            email: logisticsEmail,
            phone: '1234500003',
            passwordHash,
            role: 'logistics',
            isDemoAccount: true
        });
        console.log('Demo Logistics created.');
    }
    else {
        console.log('Demo Logistics already exists.');
    }
    let bank = await User_1.User.findOne({ email: bankEmail });
    if (!bank) {
        bank = await User_1.User.create({
            name: 'State Bank of Agri',
            email: bankEmail,
            phone: '1234500004',
            passwordHash,
            role: 'bank',
            isDemoAccount: true
        });
        console.log('Demo Bank created.');
    }
    else {
        console.log('Demo Bank already exists.');
    }
    // 2. Create Crops
    let insertedCrops = await Crop_1.Crop.find({ isDemoAccount: true });
    if (insertedCrops.length === 0) {
        const cropMetadata = [
            { name: 'Organic Tomato', category: 'Vegetables', unit: 'kg', imageUrl: '/images/crops/tomato.jpg', price: 40, qty: 800, isOrganic: true },
            { name: 'Basmati Rice', category: 'Grains', unit: 'quintal', imageUrl: '/images/crops/rice.jpg', price: 6500, qty: 150, isOrganic: true },
            { name: 'Fresh Potatoes', category: 'Vegetables', unit: 'kg', imageUrl: '/images/crops/potato.jpg', price: 20, qty: 2500, isOrganic: false },
            { name: 'Premium Wheat', category: 'Grains', unit: 'quintal', imageUrl: '/images/crops/wheat.jpg', price: 2200, qty: 500, isOrganic: false },
            { name: 'Red Onion', category: 'Vegetables', unit: 'kg', imageUrl: '/images/crops/onion.jpg', price: 35, qty: 1200, isOrganic: false },
            { name: 'Sweet Sugarcane', category: 'Cash Crop', unit: 'ton', imageUrl: '/images/crops/sugarcane.jpg', price: 3100, qty: 45, isOrganic: true },
        ];
        const cropsToInsert = cropMetadata.map(meta => ({
            farmerId: farmer._id,
            name: meta.name,
            description: `High-quality, farm-fresh ${meta.name} harvested directly from Ramesh's farm.`,
            category: meta.category,
            pricePerUnit: meta.price,
            quantity: meta.qty,
            unit: meta.unit,
            isOrganic: meta.isOrganic,
            images: [meta.imageUrl],
            status: 'listed',
            location: farmer.location,
            isDemoAccount: true
        }));
        insertedCrops = await Crop_1.Crop.insertMany(cropsToInsert);
        console.log(`${insertedCrops.length} crops seeded.`);
    }
    else {
        console.log('Demo crops already exist.');
    }
    // 3. Create Auctions (Live, Scheduled, Closed)
    const auctionCount = await Auction_1.Auction.countDocuments({ isDemoAccount: true });
    if (auctionCount === 0 && insertedCrops.length >= 3) {
        const now = new Date();
        // 3.1 Live Auction (Starts 1 hour ago, ends in 24 hours, includes bid by buyer)
        const liveAuction = await Auction_1.Auction.create({
            cropId: insertedCrops[0]._id,
            farmerId: farmer._id,
            startTime: new Date(now.getTime() - 3600000),
            endTime: new Date(now.getTime() + 86400000),
            startingBid: 3500,
            currentHighestBid: 4000,
            status: 'live',
            quantity: 100,
            minIncrement: 100,
            bids: [{ bidderId: buyer._id, amount: 4000, timestamp: new Date(now.getTime() - 1800000) }],
            isDemoAccount: true
        });
        // Initialize live auction Redis state if redis is connected
        try {
            const redisKey = `auction:${liveAuction._id}:highest_bid`;
            await redis_1.redisClient.set(redisKey, '4000');
            console.log('Live auction Redis highest_bid initialized.');
        }
        catch (err) {
            console.warn('Redis is not available for initializing live auction highest bid:', err);
        }
        // 3.2 Scheduled Auction (Starts in 24 hours)
        await Auction_1.Auction.create({
            cropId: insertedCrops[1]._id,
            farmerId: farmer._id,
            startTime: new Date(now.getTime() + 86400000),
            endTime: new Date(now.getTime() + 172800000),
            startingBid: 7000,
            currentHighestBid: 0,
            status: 'scheduled',
            quantity: 50,
            minIncrement: 100,
            bids: [],
            isDemoAccount: true
        });
        // 3.3 Closed Auction (Ended 2 hours ago, won by buyer)
        await Auction_1.Auction.create({
            cropId: insertedCrops[2]._id,
            farmerId: farmer._id,
            startTime: new Date(now.getTime() - 172800000),
            endTime: new Date(now.getTime() - 7200000),
            startingBid: 15000,
            currentHighestBid: 18500,
            winnerId: buyer._id,
            status: 'closed',
            quantity: 1000,
            minIncrement: 500,
            bids: [{ bidderId: buyer._id, amount: 18500, timestamp: new Date(now.getTime() - 7200000) }],
            isDemoAccount: true
        });
        console.log('Auctions seeded (Live, Scheduled, Closed).');
    }
    else {
        console.log('Demo auctions already exist or crops are not seeded yet.');
    }
    // 4. Create Sourcing Orders (8 completed, 2 pending)
    const orderCount = await Order_1.Order.countDocuments({ isDemoAccount: true });
    let insertedOrders = [];
    if (orderCount === 0 && insertedCrops.length > 0) {
        const now = new Date();
        const orders = [];
        for (let i = 0; i < 10; i++) {
            const crop = insertedCrops[i % insertedCrops.length];
            const qty = 5 + i * 2;
            const amount = crop.pricePerUnit * qty;
            orders.push({
                buyerId: buyer._id,
                farmerId: farmer._id,
                cropId: crop._id,
                quantity: qty,
                totalAmount: amount,
                paymentStatus: i < 8 ? 'completed' : 'pending',
                deliveryStatus: i < 8 ? 'delivered' : 'pending',
                isDemoAccount: true,
                createdAt: new Date(now.getTime() - i * 2 * 86400000)
            });
        }
        insertedOrders = await Order_1.Order.insertMany(orders);
        console.log(`${insertedOrders.length} orders seeded.`);
    }
    else {
        insertedOrders = await Order_1.Order.find({ isDemoAccount: true });
        console.log('Demo orders already exist.');
    }
    // 5. Create Deliveries for some completed orders
    const deliveryCount = await Delivery_1.Delivery.countDocuments({ isDemoAccount: true });
    if (deliveryCount === 0 && insertedOrders.length >= 4) {
        const deliveryStatuses = ['delivered', 'in_transit', 'packed', 'pending'];
        const deliveries = insertedOrders.slice(0, 4).map((order, idx) => ({
            orderId: order._id,
            logisticsPartnerId: logistics._id,
            pickupLocation: farmer.location,
            dropLocation: {
                type: 'Point',
                coordinates: [72.8777, 19.0760],
                address: 'Warehouse A, Sector 4',
                city: 'Mumbai',
                state: 'Maharashtra',
                zipCode: '400001'
            },
            status: deliveryStatuses[idx],
            isDemoAccount: true
        }));
        await Delivery_1.Delivery.insertMany(deliveries);
        console.log('Deliveries seeded.');
    }
    else {
        console.log('Demo deliveries already exist or orders not loaded.');
    }
    // 6. Create Transactions (financial logs)
    const transactionCount = await Transaction_1.Transaction.countDocuments({ isDemoAccount: true });
    if (transactionCount === 0 && insertedOrders.length >= 8) {
        const transactions = insertedOrders.slice(0, 8).map(order => ({
            orderId: order._id,
            payerId: buyer._id,
            payeeId: farmer._id,
            amount: order.totalAmount,
            mode: 'bank',
            status: 'success',
            timestamp: order.createdAt,
            isDemoAccount: true
        }));
        await Transaction_1.Transaction.insertMany(transactions);
        console.log('Transactions seeded.');
    }
    else {
        console.log('Demo transactions already exist or orders not loaded.');
    }
    // 7. Create Loans
    const loanCount = await Loan_1.Loan.countDocuments({ isDemoAccount: true });
    if (loanCount === 0) {
        await Loan_1.Loan.create({
            farmerId: farmer._id,
            bankId: bank._id,
            amountRequested: 250000,
            amountApproved: 250000,
            tenure: 12,
            interestRate: 8.5,
            status: 'disbursed',
            isDemoAccount: true
        });
        await Loan_1.Loan.create({
            farmerId: farmer._id,
            bankId: bank._id,
            amountRequested: 500000,
            tenure: 24,
            status: 'pending',
            isDemoAccount: true
        });
        console.log('Loans seeded.');
    }
    else {
        console.log('Demo loans already exist.');
    }
    // 8. Create Wishlist for Buyer
    const wishlistCount = await Wishlist_1.Wishlist.countDocuments({ buyerId: buyer._id });
    if (wishlistCount === 0 && insertedCrops.length >= 5) {
        await Wishlist_1.Wishlist.create({
            buyerId: buyer._id,
            cropIds: [insertedCrops[3]._id, insertedCrops[4]._id],
            isDemoAccount: true
        });
        console.log('Wishlist seeded.');
    }
    else {
        console.log('Demo wishlist already exists or crops not loaded.');
    }
    // 9. Create Notifications
    const notificationCount = await Notification_1.Notification.countDocuments({ isDemoAccount: true });
    if (notificationCount === 0) {
        const notifications = [
            { userId: farmer._id, type: 'order', title: 'New Sourcing Order Received', message: 'FreshMart Ltd placed an order for Organic Tomato.' },
            { userId: farmer._id, type: 'payment', title: 'AgriCredit Ledger Updated', message: 'Payout of ₹32,000 processed successfully.' },
            { userId: buyer._id, type: 'auction', title: 'Outbid Alert', message: 'You have been outbid on Premium Wheat Auction.' },
        ].map(notif => ({
            ...notif,
            isRead: false,
            channel: 'in_app',
            isDemoAccount: true
        }));
        await Notification_1.Notification.insertMany(notifications);
        console.log('Notifications seeded.');
    }
    else {
        console.log('Demo notifications already exist.');
    }
    console.log('Demo seeding operation complete.');
};
exports.seedDemoData = seedDemoData;
const clearDemoData = async () => {
    console.log('Clearing demo data (only system-seeded records)...');
    await User_1.User.deleteMany({ isDemoAccount: true });
    await Crop_1.Crop.deleteMany({ isDemoAccount: true });
    await Auction_1.Auction.deleteMany({ isDemoAccount: true });
    await Order_1.Order.deleteMany({ isDemoAccount: true });
    await Delivery_1.Delivery.deleteMany({ isDemoAccount: true });
    await Notification_1.Notification.deleteMany({ isDemoAccount: true });
    await Transaction_1.Transaction.deleteMany({ isDemoAccount: true });
    await Loan_1.Loan.deleteMany({ isDemoAccount: true });
    await Wishlist_1.Wishlist.deleteMany({ isDemoAccount: true });
    console.log('Demo data cleared.');
};
exports.clearDemoData = clearDemoData;
const seedDashboardData = async (shouldDisconnect = false) => {
    try {
        await (0, exports.seedDemoData)();
    }
    catch (err) {
        console.error('Error during demo seeding:', err);
    }
    finally {
        if (shouldDisconnect) {
            const mongoose = require('mongoose');
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB.');
        }
    }
};
exports.seedDashboardData = seedDashboardData;
