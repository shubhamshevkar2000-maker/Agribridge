import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { getPlatformKPIs } from '../services/analytics.service';
import { Order } from '../models/Order';
import { Crop } from '../models/Crop';
import { Auction } from '../models/Auction';
import { Delivery } from '../models/Delivery';

const router = Router();

// Admin platform KPIs
router.get('/kpis', protect, async (req, res) => {
  try {
    const data = await getPlatformKPIs();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Farmer business intelligence analytics
router.get('/farmer', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Total Revenue (all completed payments for this farmer)
    const completedOrders = await Order.find({ farmerId: userId, paymentStatus: 'completed' }).populate('cropId');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 2. Monthly Sales (completed orders this month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlySales = completedOrders
      .filter(o => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // 3. Top Selling Crop (name of crop with highest total quantity sold)
    const cropSales: { [name: string]: number } = {};
    completedOrders.forEach(o => {
      if (o.cropId) {
        const cropName = (o.cropId as any).name;
        cropSales[cropName] = (cropSales[cropName] || 0) + o.quantity;
      }
    });
    
    let topSellingCrop = null;
    let maxQuantity = 0;
    Object.entries(cropSales).forEach(([name, qty]) => {
      if (qty > maxQuantity) {
        maxQuantity = qty;
        topSellingCrop = name as any;
      }
    });

    // 4. Inventory Value (Sum of quantity * pricePerUnit for draft or listed crops)
    const farmerCrops = await Crop.find({ farmerId: userId, status: { $in: ['draft', 'listed'] } });
    const inventoryValue = farmerCrops.reduce((sum, c) => sum + ((c.quantity || 0) * (c.pricePerUnit || 0)), 0);

    // 5. Orders Completed (Count of completed orders)
    const ordersCompleted = completedOrders.length;

    // 6. Active Listings (Count of listed crops)
    const activeListings = farmerCrops.filter(c => c.status === 'listed').length;

    // 7. Delivery Success Rate (percentage of delivered shipments)
    const farmerOrderDocs = await Order.find({ farmerId: userId });
    const farmerOrderIds = farmerOrderDocs.map(o => o._id);
    const farmerDeliveries = await Delivery.find({ orderId: { $in: farmerOrderIds } });
    const totalDeliveries = farmerDeliveries.length;
    const successfulDeliveries = farmerDeliveries.filter(d => d.status === 'delivered').length;
    const deliverySuccessRate = totalDeliveries > 0 ? Math.round((successfulDeliveries / totalDeliveries) * 100) : null;

    // 8. Average Auction Price (average highest bid of farmer's live or closed auctions)
    const farmerAuctions = await Auction.find({ farmerId: userId });
    const totalAuctionPrice = farmerAuctions.reduce((sum, a) => sum + (a.currentHighestBid || a.startingBid || 0), 0);
    const averageAuctionPrice = farmerAuctions.length > 0 ? Math.round(totalAuctionPrice / farmerAuctions.length) : null;

    res.json({
      success: true,
      data: {
        totalRevenue,
        monthlySales,
        topSellingCrop,
        inventoryValue,
        ordersCompleted,
        activeListings,
        deliverySuccessRate,
        averageAuctionPrice
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
