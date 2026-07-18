'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, FileText, XCircle, DollarSign, Truck, User, Phone, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CropImage } from '@/components/ui/crop-image';
import { StatusBadge } from '@/components/ui/status-badge';
import { DeliveryTimeline } from '@/components/ui/delivery-timeline';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayCash = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/pay-cash`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Cash payment request initiated. Please share the confirmation OTP with the farmer upon delivery.');
        fetchOrders();
      } else {
        alert(data.message || 'Error triggering cash payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? This will release the crop quantity back to inventory.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Order has been cancelled successfully.');
        fetchOrders();
      } else {
        alert(data.message || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while cancelling order.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrder(prev => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground font-semibold">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">My Orders</h1>
        <p className="text-muted-foreground mt-1">Track crop shipments, download tax invoices, and complete payments.</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState 
          icon={ShoppingBag} 
          title="No Orders Found" 
          description="You haven't placed any sourcing orders yet. Go to the marketplace to get started."
          ctaText="Explore Marketplace"
          ctaHref="/buyer/marketplace"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const delivery = order.deliveryId || {};
            const crop = order.cropId || {};
            const farmer = order.farmerId || {};
            
            // Expected delivery formatting
            const expectedDelivery = delivery.expectedDelivery 
              ? new Date(delivery.expectedDelivery).toLocaleDateString()
              : 'Within 3-5 days';
              
            const deliveryStatus = delivery.status || 'pending';
            
            // Can cancel only if status is pending/confirmed/accepted
            const canCancel = ['pending', 'confirmed', 'accepted', 'unassigned'].includes(deliveryStatus.toLowerCase()) && order.paymentStatus !== 'completed';

            return (
              <Card key={order._id} className="glass-card overflow-hidden border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-0">
                  {/* Card Header Row */}
                  <div 
                    onClick={() => toggleExpand(order._id)}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-secondary/15 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Thumbnail crop image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted border border-border/40">
                        <CropImage images={crop.images} alt={crop.name || 'Crop'} />
                      </div>
                      
                      <div>
                        <span className="text-[10px] uppercase font-bold text-primary">{crop.category}</span>
                        <h3 className="font-bold text-base text-foreground line-clamp-1">{crop.name || 'Crop Listing'}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Order ID: <span className="font-mono">{order._id.substring(order._id.length - 8).toUpperCase()}</span></p>
                      </div>
                    </div>

                    {/* Pricing and status summary */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-border/40">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block md:inline font-medium">Grand Total: </span>
                        <span className="font-extrabold text-base text-foreground">₹{order.totalAmount}</span>
                        <span className="text-[10px] text-muted-foreground block">({order.quantity} {crop.unit || 'kg'})</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={deliveryStatus} />
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div className="p-6 border-t border-border/40 bg-secondary/5 space-y-6">
                      
                      {/* Delivery timeline stepper */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Delivery Tracker</h4>
                        <DeliveryTimeline status={deliveryStatus} />
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/30">
                        {/* Farmer & Sourcing Details */}
                        <div className="space-y-2 text-xs">
                          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Sourcing Details</h4>
                          <div className="space-y-1 text-foreground">
                            <p className="flex items-center gap-2 font-semibold">
                              <User className="w-3.5 h-3.5 text-primary" /> {farmer.name || 'Farmer'}
                            </p>
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" /> {farmer.phone || 'N/A'}
                            </p>
                            <p className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-3.5 h-3.5" /> {farmer.location?.city || 'Nashik'}, {farmer.location?.state || 'Maharashtra'}
                            </p>
                          </div>
                        </div>

                        {/* Logistics Details */}
                        <div className="space-y-2 text-xs">
                          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Logistics & Expected Delivery</h4>
                          <div className="space-y-1 text-foreground">
                            <p className="font-bold text-primary flex items-center gap-2">
                              <Truck className="w-3.5 h-3.5" /> {delivery.logisticsPartner || 'Self-Arranged Transport'}
                            </p>
                            <p className="text-muted-foreground">Driver: <span className="font-semibold text-foreground">{delivery.driverName || 'Not Assigned Yet'}</span></p>
                            <p className="text-muted-foreground">Vehicle: <span className="font-semibold text-foreground">{delivery.vehicleNumber || 'Pending Assignment'}</span></p>
                            <p className="text-muted-foreground">Expected: <span className="font-bold text-emerald-500">{expectedDelivery}</span></p>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-2 text-xs">
                          <h4 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Payment Status</h4>
                          <div className="space-y-1.5">
                            <p className="text-muted-foreground">Method: <span className="font-bold text-foreground">Cash On Delivery</span></p>
                            <p className="text-muted-foreground">Status: <span className={`font-bold ${order.paymentStatus === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{order.paymentStatus.toUpperCase()}</span></p>
                            
                            {order.paymentStatus === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handlePayCash(order._id); }}
                                className="bg-primary hover:bg-primary/90 text-white rounded-xl text-[10px] py-1 h-7 flex items-center gap-1 mt-2"
                              >
                                <DollarSign className="w-3 h-3" /> Pay Cash (Request OTP)
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons footer */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                        {canCancel && (
                          <Button 
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); handleCancelOrder(order._id); }}
                            className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl h-10 gap-1.5 text-xs font-semibold"
                          >
                            <XCircle className="w-4 h-4" /> Cancel Sourcing Order
                          </Button>
                        )}
                        <Link href={`/buyer/invoices/${order._id}`}>
                          <Button 
                            className="bg-primary/10 hover:bg-primary/20 text-primary rounded-xl h-10 gap-1.5 text-xs font-semibold"
                          >
                            <FileText className="w-4 h-4" /> View Tax Invoice
                          </Button>
                        </Link>
                      </div>

                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
