import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { Delivery } from '../models/Delivery';
import { Vehicle } from '../models/Vehicle';
import { User } from '../models/User';
import { Order } from '../models/Order';

const router = Router();

// GET /api/logistics/dashboard — KPI stats
router.get('/dashboard', protect, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const activeDeliveries = await Delivery.countDocuments({
      logisticsPartnerId: userId,
      status: { $in: ['accepted', 'picked_up', 'in_transit'] }
    });

    const completedDeliveries = await Delivery.countDocuments({
      logisticsPartnerId: userId,
      status: 'delivered'
    });

    const earningsResult = await Delivery.aggregate([
      { $match: { logisticsPartnerId: userId, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$earnings' } } }
    ]);
    const earnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

    const fleetCount = await Vehicle.countDocuments({ logisticsPartnerId: userId });

    const recentDeliveries = await Delivery.find({ logisticsPartnerId: userId })
      .populate({
        path: 'orderId',
        populate: { path: 'cropId', select: 'name category' }
      })
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        activeDeliveries,
        completedDeliveries,
        earnings,
        fleetCount,
        recentDeliveries
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/logistics/vehicles — List vehicles
router.get('/vehicles', protect, async (req: any, res) => {
  try {
    const vehicles = await Vehicle.find({ logisticsPartnerId: req.user.id }).sort({ createdAt: -1 });

    const total = vehicles.length;
    const active = vehicles.filter(v => v.verified).length;
    const available = vehicles.filter(v => !v.verified).length;

    res.json({
      success: true,
      data: {
        vehicles,
        stats: { total, active, available, maintenance: 0 }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/logistics/vehicles — Add vehicle
router.post('/vehicles', protect, async (req: any, res) => {
  try {
    const { type, capacity, registrationNumber, insuranceDoc } = req.body;

    if (!type || !capacity || !registrationNumber || !insuranceDoc) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await Vehicle.findOne({ registrationNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Vehicle with this registration already exists' });
    }

    const vehicle = await Vehicle.create({
      logisticsPartnerId: req.user.id,
      type,
      capacity,
      registrationNumber,
      insuranceDoc
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/logistics/active-routes — Deliveries in transit
router.get('/active-routes', protect, async (req: any, res) => {
  try {
    const deliveries = await Delivery.find({
      logisticsPartnerId: req.user.id,
      status: { $in: ['accepted', 'picked_up', 'in_transit'] }
    })
      .populate({
        path: 'orderId',
        populate: [
          { path: 'cropId', select: 'name category' },
          { path: 'farmerId', select: 'name phone location' },
          { path: 'buyerId', select: 'name phone location' }
        ]
      })
      .populate('vehicleId', 'type capacity registrationNumber')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: deliveries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/logistics/history — Completed deliveries
router.get('/history', protect, async (req: any, res) => {
  try {
    const deliveries = await Delivery.find({
      logisticsPartnerId: req.user.id,
      status: 'delivered'
    })
      .populate({
        path: 'orderId',
        populate: [
          { path: 'cropId', select: 'name category' },
          { path: 'farmerId', select: 'name phone' },
          { path: 'buyerId', select: 'name phone' }
        ]
      })
      .populate('vehicleId', 'type registrationNumber')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: deliveries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/logistics/profile — Fetch profile
router.get('/profile', protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const vehicleCount = await Vehicle.countDocuments({ logisticsPartnerId: req.user.id });

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        vehicleCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/logistics/profile — Update profile
router.put('/profile', protect, async (req: any, res) => {
  try {
    const { name, phone, email, location, languages } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (location) updateData.location = location;
    if (languages) updateData.languages = languages;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/logistics/deliveries/:id/status — Update delivery status
router.put('/deliveries/:id/status', protect, async (req: any, res) => {
  try {
    const { status, vehicleId } = req.body;
    const validStatuses = ['accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }

    // If accepting an unassigned delivery, assign this logistics partner
    if (status === 'accepted' && !delivery.logisticsPartnerId) {
      delivery.logisticsPartnerId = req.user.id as any;
      if (vehicleId) {
        delivery.vehicleId = vehicleId;
      }
    } else if (delivery.logisticsPartnerId?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    delivery.status = status as any;
    await delivery.save();

    // Update order delivery status too
    if (delivery.orderId) {
      await Order.findByIdAndUpdate(delivery.orderId, { deliveryStatus: status });
    }

    res.json({ success: true, data: delivery });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
