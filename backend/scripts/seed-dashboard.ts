import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from '../src/models/User';
import { Crop } from '../src/models/Crop';
import { Auction } from '../src/models/Auction';
import { Order } from '../src/models/Order';
import { Delivery } from '../src/models/Delivery';
import { Notification } from '../src/models/Notification';
import { Transaction } from '../src/models/Transaction';
import { Loan } from '../src/models/Loan';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is required in .env');
  process.exit(1);
}

const seedDashboard = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clean up specific seed users based on email
    console.log('Cleaning up existing seed data...');
    const seedEmails = ['farmer_seed@example.com', 'buyer_seed@example.com', 'logistics_seed@example.com'];
    const existingUsers = await User.find({ email: { $in: seedEmails } });
    const userIds = existingUsers.map(u => u._id);

    await Crop.deleteMany({ farmerId: { $in: userIds } });
    await Auction.deleteMany({ farmerId: { $in: userIds } });
    await Order.deleteMany({ farmerId: { $in: userIds } });
    await Delivery.deleteMany({ orderId: { $in: (await Order.find({ farmerId: { $in: userIds } })).map(o => o._id) } });
    await Notification.deleteMany({ userId: { $in: userIds } });
    await Transaction.deleteMany({ $or: [{ payerId: { $in: userIds } }, { payeeId: { $in: userIds } }] });
    await Loan.deleteMany({ farmerId: { $in: userIds } });
    await User.deleteMany({ email: { $in: seedEmails } });

    console.log('Inserting fresh seed data...');

    // 1. Create Users
    const passwordHash = await bcrypt.hash('password123', 10);
    const farmer = await User.create({
      name: 'Ramesh Kumar',
      email: 'farmer_seed@example.com',
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
      walletBalance: 125000
    });

    const buyer = await User.create({
      name: 'FreshMart Ltd',
      email: 'buyer_seed@example.com',
      phone: '1234500002',
      passwordHash,
      role: 'buyer'
    });

    const logistics = await User.create({
      name: 'AgriTrans',
      email: 'logistics_seed@example.com',
      phone: '1234500003',
      passwordHash,
      role: 'logistics'
    });

    // 2. Create Crops (20 crops: 15 available, 5 low stock)
    const crops = [];
    const cropNames = ['Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Soybean', 'Cotton', 'Sugarcane', 'Maize', 'Bajra'];
    for (let i = 0; i < 20; i++) {
      crops.push({
        farmerId: farmer._id,
        name: cropNames[i % cropNames.length] + (i > 9 ? ' (Premium)' : ''),
        description: 'Freshly harvested organic produce.',
        category: i % 2 === 0 ? 'Vegetables' : 'Grains',
        pricePerUnit: 1500 + Math.floor(Math.random() * 5000), // per unit
        quantity: i < 5 ? (10 + Math.floor(Math.random() * 40)) : (200 + Math.floor(Math.random() * 800)), // First 5 are low stock (< 50)
        unit: 'quintal',
        isOrganic: i % 3 === 0,
        images: ['https://placehold.co/600x400/2ecc71/ffffff?text=Crop+Image'],
        status: 'listed',
        location: farmer.location
      });
    }
    const insertedCrops = await Crop.insertMany(crops);

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
        bids: [{ bidderId: buyer._id, amount: insertedCrops[i].pricePerUnit + 500, timestamp: new Date() }]
      });
    }
    await Auction.insertMany(auctions);

    // 4. Create Orders (10 orders: 8 completed, 2 pending)
    const orders = [];
    let totalRevenue = 0;
    for (let i = 0; i < 10; i++) {
      const amount = insertedCrops[i + 5].pricePerUnit * 2;
      if (i < 8) totalRevenue += amount;
      
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
    const insertedOrders = await Order.insertMany(orders);

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
    await Delivery.insertMany(deliveries);

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
    await Notification.insertMany(notifications);

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
    await Transaction.insertMany(transactions);

    console.log('Seed completed successfully!');
    console.log(`Test Farmer Email: ${farmer.email} | Password: password123`);

    mongoose.disconnect();
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDashboard();
