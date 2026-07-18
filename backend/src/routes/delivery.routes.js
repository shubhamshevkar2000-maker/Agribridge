"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Delivery_1 = require("../models/Delivery");
const Order_1 = require("../models/Order");
const router = (0, express_1.Router)();
// GET /api/deliveries
router.get('/', auth_middleware_1.protect, async (req, res) => {
    try {
        // Find orders for this user (either as buyer or farmer)
        const userRole = req.user.role;
        const orderQuery = userRole === 'farmer' ? { farmerId: req.user.id } : { buyerId: req.user.id };
        const orders = await Order_1.Order.find(orderQuery);
        const orderIds = orders.map(o => o._id);
        const deliveries = await Delivery_1.Delivery.find({ orderId: { $in: orderIds } })
            .populate({
            path: 'orderId',
            populate: { path: 'cropId', select: 'name category' }
        })
            .populate('logisticsPartnerId', 'name phone')
            .populate('driverId', 'name phone')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: deliveries });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// POST /api/deliveries
router.post('/', auth_middleware_1.protect, async (req, res) => {
    try {
        const { orderId, pickupLocation, dropLocation } = req.body;
        // Ensure order exists and belongs to farmer
        const order = await Order_1.Order.findOne({ _id: orderId, farmerId: req.user.id });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or not authorized' });
        }
        const newDelivery = await Delivery_1.Delivery.create({
            orderId,
            pickupLocation: pickupLocation || { type: 'Point', coordinates: [0, 0] },
            dropLocation: dropLocation || { type: 'Point', coordinates: [0, 0] },
            status: 'unassigned'
        });
        res.status(201).json({ success: true, data: newDelivery });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Distance calculation using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}
// GET /api/deliveries/pool
router.get('/pool', auth_middleware_1.protect, async (req, res) => {
    try {
        // Find all pending orders that need delivery
        const pendingOrders = await Order_1.Order.find({ deliveryStatus: 'pending' })
            .populate('farmerId', 'name location')
            .populate('buyerId', 'name location')
            .populate('cropId', 'name category');
        const pools = [];
        const MAX_RADIUS_KM = 50;
        const COST_PER_KM = 20;
        for (const order of pendingOrders) {
            if (!order.farmerId || !order.farmerId.location?.coordinates)
                continue;
            const farmerCoords = order.farmerId.location.coordinates;
            let addedToPool = false;
            // Try to add to existing pool
            for (const pool of pools) {
                const poolCenter = pool.center;
                const distance = getDistanceFromLatLonInKm(farmerCoords[1], farmerCoords[0], // lat, lon
                poolCenter[1], poolCenter[0]);
                if (distance <= MAX_RADIUS_KM) {
                    pool.orders.push(order);
                    pool.totalQuantity += order.quantity;
                    pool.maxDistance = Math.max(pool.maxDistance, distance);
                    addedToPool = true;
                    break;
                }
            }
            // Create new pool if no matching one
            if (!addedToPool) {
                pools.push({
                    id: `pool_${Math.random().toString(36).substr(2, 9)}`,
                    center: farmerCoords, // [lon, lat]
                    orders: [order],
                    totalQuantity: order.quantity,
                    maxDistance: 0
                });
            }
        }
        // Calculate cost splits
        const suggestedRoutes = pools.map(pool => {
            // Estimated route distance = center to furthest point * 2 (round trip pickup) + dropoff dist
            const estimatedPickupDistance = pool.maxDistance * 2 || 10;
            const estimatedTotalCost = estimatedPickupDistance * COST_PER_KM;
            // Split cost based on quantity ratio
            const ordersWithCostSplit = pool.orders.map((o) => ({
                orderId: o._id,
                crop: o.cropId,
                farmer: o.farmerId,
                buyer: o.buyerId,
                quantity: o.quantity,
                costShare: (o.quantity / pool.totalQuantity) * estimatedTotalCost
            }));
            return {
                poolId: pool.id,
                center: pool.center,
                totalQuantity: pool.totalQuantity,
                estimatedTotalCost,
                orders: ordersWithCostSplit
            };
        });
        res.json({ success: true, data: suggestedRoutes });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/deliveries/:id
router.get('/:id', auth_middleware_1.protect, async (req, res) => {
    try {
        const delivery = await Delivery_1.Delivery.findById(req.params.id)
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// GET /api/deliveries/assigned
router.get('/assigned', auth_middleware_1.protect, async (req, res) => {
    try {
        if (req.user.role !== 'logistics') {
            return res.status(403).json({ success: false, message: 'Only logistics can view assigned deliveries' });
        }
        const deliveries = await Delivery_1.Delivery.find({ logisticsPartnerId: req.user.id })
            .populate({
            path: 'orderId',
            populate: [
                { path: 'cropId', select: 'name category quantity unit' },
                { path: 'farmerId', select: 'name location phone' },
                { path: 'buyerId', select: 'name location phone' }
            ]
        })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: deliveries });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// PUT /api/deliveries/:id/status
router.put('/:id/status', auth_middleware_1.protect, async (req, res) => {
    try {
        if (req.user.role !== 'logistics') {
            return res.status(403).json({ success: false, message: 'Only logistics can update status' });
        }
        const { status } = req.body;
        const validStatuses = ['pending', 'in_transit', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const delivery = await Delivery_1.Delivery.findOneAndUpdate({ _id: req.params.id, logisticsPartnerId: req.user.id }, { status }, { new: true });
        if (!delivery) {
            return res.status(404).json({ success: false, message: 'Delivery not found or not assigned to you' });
        }
        // Also update order status if delivered
        if (status === 'delivered') {
            await Order_1.Order.findByIdAndUpdate(delivery.orderId, { deliveryStatus: 'delivered' });
        }
        res.json({ success: true, data: delivery });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
