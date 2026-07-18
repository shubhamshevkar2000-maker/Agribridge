"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const User_1 = require("../src/models/User");
const Crop_1 = require("../src/models/Crop");
const Auction_1 = require("../src/models/Auction");
const Order_1 = require("../src/models/Order");
const Delivery_1 = require("../src/models/Delivery");
const Notification_1 = require("../src/models/Notification");
const Transaction_1 = require("../src/models/Transaction");
const Loan_1 = require("../src/models/Loan");
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('MONGO_URI is required in .env');
    process.exit(1);
}
const seedDashboard = async () => {
    try {
        await mongoose_1.default.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        // Read demo credentials from env or use fallback defaults
        const farmerEmail = process.env.DEMO_FARMER_EMAIL || 'demo.farmer@agribridge.com';
        const farmerPassword = process.env.DEMO_FARMER_PASSWORD || 'Demo@123';
        const buyerEmail = process.env.DEMO_BUYER_EMAIL || 'demo.buyer@agribridge.com';
        const buyerPassword = process.env.DEMO_BUYER_PASSWORD || 'Demo@123';
        // Clean up specific seed users based on email
        console.log('Cleaning up existing seed data...');
        const seedEmails = [
            farmerEmail,
            buyerEmail,
            'logistics_seed@example.com',
            'farmer_seed@example.com',
            'buyer_seed@example.com'
        ];
        const existingUsers = await User_1.User.find({ email: { $in: seedEmails } });
        const userIds = existingUsers.map(u => u._id);
        await Crop_1.Crop.deleteMany({ farmerId: { $in: userIds } });
        await Auction_1.Auction.deleteMany({ farmerId: { $in: userIds } });
        await Order_1.Order.deleteMany({ farmerId: { $in: userIds } });
        await Delivery_1.Delivery.deleteMany({ orderId: { $in: (await Order_1.Order.find({ farmerId: { $in: userIds } })).map(o => o._id) } });
        await Notification_1.Notification.deleteMany({ userId: { $in: userIds } });
        await Transaction_1.Transaction.deleteMany({ $or: [{ payerId: { $in: userIds } }, { payeeId: { $in: userIds } }] });
        await Loan_1.Loan.deleteMany({ farmerId: { $in: userIds } });
        await User_1.User.deleteMany({ email: { $in: seedEmails } });
        console.log('Inserting fresh seed data...');
        // 1. Create Users
        const farmerPasswordHash = await bcrypt_1.default.hash(farmerPassword, 10);
        const buyerPasswordHash = await bcrypt_1.default.hash(buyerPassword, 10);
        const logisticsPasswordHash = await bcrypt_1.default.hash('password123', 10);
        const farmer = await User_1.User.create({
            name: 'Ramesh Kumar',
            email: farmerEmail,
            phone: '1234500001',
            passwordHash: farmerPasswordHash,
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
        const buyer = await User_1.User.create({
            name: 'FreshMart Ltd',
            email: buyerEmail,
            phone: '1234500002',
            passwordHash: buyerPasswordHash,
            role: 'buyer',
            isDemoAccount: true
        });
        const logistics = await User_1.User.create({
            name: 'AgriTrans',
            email: 'logistics_seed@example.com',
            phone: '1234500003',
            passwordHash: logisticsPasswordHash,
            role: 'logistics',
            isDemoAccount: true
        });
        // 2. Create Crops (20 crops: 15 available, 5 low stock)
        const crops = [];
        const cropNames = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Soybean', 'Cotton', 'Sugarcane', 'Maize', 'Bajra'];
        const cropImages = {
            'Tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
            'Onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
            'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
            'Wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
            'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
            'Soybean': 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80',
            'Cotton': 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&w=800&q=80',
            'Sugarcane': 'https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=800&q=80',
            'Maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
            'Bajra': 'https://images.unsplash.com/photo-1606757389105-64e8e4f1a16b?auto=format&fit=crop&w=800&q=80',
        };
        for (let i = 0; i < 20; i++) {
            const currentName = cropNames[i % cropNames.length];
            crops.push({
                farmerId: farmer._id,
                name: currentName + (i > 9 ? ' (Premium)' : ''),
                description: 'Freshly harvested organic produce.',
                category: i % 2 === 0 ? 'Vegetables' : 'Grains',
                pricePerUnit: 1500 + Math.floor(Math.random() * 5000), // per unit
                quantity: i < 5 ? (10 + Math.floor(Math.random() * 40)) : (200 + Math.floor(Math.random() * 800)), // First 5 are low stock (< 50)
                unit: 'quintal',
                isOrganic: i % 3 === 0,
                images: [cropImages[currentName]],
                status: 'listed',
                location: farmer.location
            });
        }
        const insertedCrops = await Crop_1.Crop.insertMany(crops);
        // 3. Create Auctions (5 active)
        const auctions = [];
        for (let i = 0; i < 5; i++) {
            auctions.push({
                cropId: insertedCrops[i]._id,
                farmerId: farmer._id,
                startingBid: insertedCrops[i].pricePerUnit,
                currentHighestBid: insertedCrops[i].pricePerUnit + 500,
                startTime: new Date(Date.now() - 3600000), // 1 hour ago
                endTime: new Date(Date.now() + 86400000), // 24 hours from now
                status: 'live',
                quantity: Math.floor(insertedCrops[i].quantity / 2) || 10,
                minIncrement: 100,
                bids: [{ bidderId: buyer._id, amount: insertedCrops[i].pricePerUnit + 500, timestamp: new Date() }]
            });
        }
        await Auction_1.Auction.insertMany(auctions);
        // 4. Create Orders (10 orders: 8 completed, 2 pending)
        const orders = [];
        let totalRevenue = 0;
        for (let i = 0; i < 10; i++) {
            const amount = insertedCrops[i + 5].pricePerUnit * 2;
            if (i < 8)
                totalRevenue += amount;
            orders.push({
                buyerId: buyer._id,
                farmerId: farmer._id,
                cropId: insertedCrops[i + 5]._id,
                quantity: 2,
                totalAmount: amount,
                paymentStatus: i < 8 ? 'completed' : 'pending',
                deliveryStatus: i < 8 ? 'delivered' : 'pending',
                createdAt: new Date(Date.now() - Math.random() * 2592000000) // Within last 30 days
            });
        }
        const insertedOrders = await Order_1.Order.insertMany(orders);
        // 5. Create Deliveries (6 deliveries for the completed orders)
        const deliveries = [];
        const statuses = ['unassigned', 'picked_up', 'in_transit', 'delivered', 'delivered', 'delivered'];
        for (let i = 0; i < 6; i++) {
            deliveries.push({
                orderId: insertedOrders[i]._id,
                logisticsPartnerId: logistics._id,
                pickupLocation: farmer.location,
                dropLocation: { type: 'Point', coordinates: [72.8777, 19.0760] },
                status: statuses[i]
            });
        }
        await Delivery_1.Delivery.insertMany(deliveries);
        // 6. Create Notifications (15 notifications)
        const notifications = [];
        for (let i = 0; i < 15; i++) {
            notifications.push({
                userId: farmer._id,
                type: ['order', 'auction', 'payment', 'system'][i % 4],
                title: ['New Order Received', 'Bid Placed', 'Payment Credited', 'Weather Alert'][i % 4],
                message: 'This is a sample notification message for the dashboard.',
                isRead: i > 5, // First 5 are unread
                channel: 'in_app',
                createdAt: new Date(Date.now() - Math.random() * 86400000) // Last 24 hours
            });
        }
        await Notification_1.Notification.insertMany(notifications);
        // 7. Create Transactions (Recent Activity)
        const transactions = [];
        for (let i = 0; i < 8; i++) {
            transactions.push({
                orderId: insertedOrders[i]._id,
                payerId: buyer._id,
                payeeId: farmer._id,
                amount: insertedOrders[i].totalAmount,
                mode: 'bank',
                status: 'success',
                timestamp: insertedOrders[i].createdAt
            });
        }
        await Transaction_1.Transaction.insertMany(transactions);
        console.log('Seed completed successfully!');
        console.log(`Test Farmer Email: ${farmer.email} | Password: ${farmerPassword}`);
        console.log(`Test Buyer Email: ${buyer.email} | Password: ${buyerPassword}`);
        mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};
seedDashboard();
