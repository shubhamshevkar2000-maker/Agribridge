"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeRoute = exports.updateDeliveryStatus = void 0;
const Delivery_1 = require("../models/Delivery");
const Order_1 = require("../models/Order");
const notification_service_1 = require("./notification.service");
const socket_1 = require("../config/socket");
const updateDeliveryStatus = async (deliveryId, status, currentLocation) => {
    const delivery = await Delivery_1.Delivery.findById(deliveryId).populate('orderId');
    if (!delivery)
        throw new Error('Delivery not found');
    const mappedStatus = status === 'pending' ? 'accepted' : status;
    delivery.status = mappedStatus;
    if (currentLocation) {
        delivery.route.push({
            type: 'Point',
            coordinates: [currentLocation.lng, currentLocation.lat]
        });
    }
    await delivery.save();
    if (delivery.orderId) {
        const order = await Order_1.Order.findById(delivery.orderId);
        if (order) {
            order.deliveryStatus = status;
            await order.save();
            // Notify Buyer
            await (0, notification_service_1.createNotification)({
                userId: order.buyerId.toString(),
                type: 'delivery_update',
                title: `Delivery Update: ${status.toUpperCase()}`,
                message: `Your order for ${order.cropId} is now ${status}.`,
            });
            // Notify Farmer
            await (0, notification_service_1.createNotification)({
                userId: order.farmerId.toString(),
                type: 'delivery_update',
                title: `Logistics Update: ${status.toUpperCase()}`,
                message: `The logistics partner has marked the pickup/delivery as ${status}.`,
            });
        }
    }
    // Broadcast location update if any
    if (currentLocation) {
        const io = (0, socket_1.getIO)();
        io.emit(`delivery:location_update`, {
            deliveryId,
            location: currentLocation,
            status
        });
    }
    return delivery;
};
exports.updateDeliveryStatus = updateDeliveryStatus;
// Mock function for multi-stop routing logic (TSP optimization stub)
const optimizeRoute = (waypoints) => {
    // In a real implementation, this would call OSRM or Google Maps Distance Matrix API
    // and run a TSP (Traveling Salesperson) heuristic to sort the waypoints.
    console.log('Optimizing route for waypoints:', waypoints.length);
    return waypoints; // Stub returning original order
};
exports.optimizeRoute = optimizeRoute;
