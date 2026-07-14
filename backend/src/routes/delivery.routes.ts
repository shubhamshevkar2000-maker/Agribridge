import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Delivery } from '../models/Delivery';
import { Order } from '../models/Order';
import { Crop } from '../models/Crop';

const router = Router();

// GET /api/deliveries
router.get('/', protect, async (req: any, res) => {
  try {
    // Find orders for this user (either as buyer or farmer)
    const userRole = req.user.role;
    const orderQuery = userRole === 'farmer' ? { farmerId: req.user.id } : { buyerId: req.user.id };
    
    const orders = await Order.find(orderQuery);
    const orderIds = orders.map(o => o._id);

    let deliveries = await Delivery.find({ orderId: { $in: orderIds } })
      .populate({
        path: 'orderId',
        populate: { path: 'cropId', select: 'name category' }
      })
      .populate('logisticsPartnerId', 'name phone')
      .populate('driverId', 'name phone')
      .sort({ createdAt: -1 });

    // Mock data generation for demo purposes if no deliveries exist
    if (deliveries.length === 0 && orders.length > 0) {
      const mockDelivery = await Delivery.create({
        orderId: orders[0]._id,
        pickupLocation: { type: 'Point', coordinates: [73.8567, 18.5204] }, // Pune
        dropLocation: { type: 'Point', coordinates: [72.8777, 19.0760] }, // Mumbai
        route: [
          { type: 'Point', coordinates: [73.8567, 18.5204] },
          { type: 'Point', coordinates: [73.2, 18.8] } // Mid-way
        ],
        status: 'in_transit',
        estimatedFuelCost: 1500,
        earnings: 3000
      });
      
      const populatedMock = await Delivery.findById(mockDelivery._id)
        .populate({
          path: 'orderId',
          populate: { path: 'cropId', select: 'name category' }
        });
      
      if (populatedMock) {
        deliveries = [populatedMock];
      }
    } else if (deliveries.length === 0 && orders.length === 0) {
      // If they don't even have orders, let's create a fake crop and order to demo the delivery timeline
      const fakeCrop = await Crop.create({
        farmerId: req.user.id,
        name: 'Demo Export Grapes',
        category: 'Fruits',
        quantity: 100,
        unit: 'Quintals',
        pricePerUnit: 4000,
        status: 'sold'
      });
      
      const fakeOrder = await Order.create({
        buyerId: req.user.id, // Just to make it queryable for this user
        farmerId: req.user.id,
        cropId: fakeCrop._id,
        quantity: 50,
        totalAmount: 200000,
        paymentStatus: 'completed',
        deliveryStatus: 'in_transit'
      });
      
      const mockDelivery = await Delivery.create({
        orderId: fakeOrder._id,
        pickupLocation: { type: 'Point', coordinates: [73.8567, 18.5204] }, 
        dropLocation: { type: 'Point', coordinates: [72.8777, 19.0760] },
        route: [
          { type: 'Point', coordinates: [73.8567, 18.5204] },
          { type: 'Point', coordinates: [73.2, 18.8] }
        ],
        status: 'in_transit',
        estimatedFuelCost: 1500,
        earnings: 3000
      });

      const populatedMock = await Delivery.findById(mockDelivery._id)
        .populate({
          path: 'orderId',
          populate: { path: 'cropId', select: 'name category' }
        });
        
      if (populatedMock) {
        deliveries = [populatedMock];
      }
    }

    res.json({ success: true, data: deliveries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/deliveries/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate({
        path: 'orderId',
        populate: [
          { path: 'cropId', select: 'name category' },
          { path: 'farmerId', select: 'name phone location' },
          { path: 'buyerId', select: 'name phone location' }
        ]
      })
      .populate('logisticsPartnerId', 'name phone')
      .populate('driverId', 'name phone');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    res.json({ success: true, data: delivery });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
