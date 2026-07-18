import { Delivery } from '../models/Delivery';
import { Order } from '../models/Order';
import { createNotification } from './notification.service';
import { getIO } from '../config/socket';

export const updateDeliveryStatus = async (
  deliveryId: string, 
  status: 'pending' | 'in_transit' | 'delivered', 
  currentLocation?: { lat: number; lng: number }
) => {
  const delivery = await Delivery.findById(deliveryId).populate('orderId');
  if (!delivery) throw new Error('Delivery not found');

  const mappedStatus = status === 'pending' ? 'accepted' : status;
  delivery.status = mappedStatus as any;
  if (currentLocation) {
    delivery.route.push({
      type: 'Point',
      coordinates: [currentLocation.lng, currentLocation.lat]
    });
  }
  await delivery.save();

  if (delivery.orderId) {
    const order = await Order.findById(delivery.orderId);
    if (order) {
      order.deliveryStatus = status;
      await order.save();

      // Notify Buyer
      await createNotification({
        userId: order.buyerId.toString(),
        type: 'delivery_update',
        title: `Delivery Update: ${status.toUpperCase()}`,
        message: `Your order for ${order.cropId} is now ${status}.`,
      });

      // Notify Farmer
      await createNotification({
        userId: order.farmerId.toString(),
        type: 'delivery_update',
        title: `Logistics Update: ${status.toUpperCase()}`,
        message: `The logistics partner has marked the pickup/delivery as ${status}.`,
      });
    }
  }

  // Broadcast location update if any
  if (currentLocation) {
    const io = getIO();
    io.emit(`delivery:location_update`, {
      deliveryId,
      location: currentLocation,
      status
    });
  }

  return delivery;
};

// Mock function for multi-stop routing logic (TSP optimization stub)
export const optimizeRoute = (waypoints: { lat: number; lng: number }[]) => {
  // In a real implementation, this would call OSRM or Google Maps Distance Matrix API
  // and run a TSP (Traveling Salesperson) heuristic to sort the waypoints.
  console.log('Optimizing route for waypoints:', waypoints.length);
  return waypoints; // Stub returning original order
};
