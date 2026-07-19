'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  ShoppingBag, 
  Clock, 
  Check, 
  X, 
  Package, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  ShieldCheck, 
  Download, 
  AlertCircle,
  Calendar,
  Layers
} from 'lucide-react';

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({});
  const [demoOtps, setDemoOtps] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Error accepting order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this order? This will release the inventory.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Error rejecting order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/ready`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Error updating order status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatch = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/dispatch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.message || 'Error dispatching order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOutForDelivery = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/out-for-delivery`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
        if (data.otp) {
          setDemoOtps(prev => ({ ...prev, [orderId]: data.otp }));
        }
      } else {
        alert(data.message || 'Error updating status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDebugOtp = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/debug/otp/${orderId}`);
      const data = await res.json();
      if (data.success && data.otp) {
        setDemoOtps(prev => ({ ...prev, [orderId]: data.otp }));
      } else {
        alert('OTP not generated yet. Ensure status is "Out for Delivery" first.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyCash = async (orderId: string) => {
    const otp = otpInputs[orderId];
    if (!otp) {
      return alert('Please enter OTP');
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/verify-cash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (data.success) {
        alert('Payment verified! AgriCredit ledger updated successfully.');
        fetchOrders();
      } else {
        alert(data.message || 'Error verifying payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadInvoice = (order: any) => {
    const invoiceContent = `
========================================
           AGRIBRIDGE INVOICE           
========================================
Order ID: ${order._id}
Date: ${new Date(order.updatedAt).toLocaleString()}
----------------------------------------
Seller: ${order.farmerId?.name || 'Farmer'}
Buyer: ${order.buyerId?.name || 'Buyer'}
Crop: ${order.cropId?.name || 'Crop'}
Quantity: ${order.quantity}
Total Price: INR ${order.totalAmount}
Payment Mode: Cash on Delivery (COD)
Payment Status: VERIFIED & COMPLETED
----------------------------------------
Thank you for trading through AgriBridge!
========================================
    `;
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order._id.substring(0, 8)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getOrderStatusStage = (order: any) => {
    if (order.deliveryStatus === 'cancelled') return 'cancelled';
    if (order.paymentStatus === 'completed' || order.deliveryStatus === 'delivered') return 'completed';
    if (order.deliveryStatus === 'in_transit') {
      return order.delivery?.isOutForDelivery ? 'out_for_delivery' : 'transit';
    }
    if (order.deliveryStatus === 'picked_up' || (order.delivery && order.delivery.status === 'packed')) return 'scheduled';
    if (order.deliveryStatus === 'confirmed') return 'accepted';
    return 'pending';
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-heading font-bold text-slate-900">Incoming Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your agricultural sales lifecycle</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 font-medium rounded-full text-xs border border-green-200">
          <Layers className="w-3.5 h-3.5" /> 6-Stage Lifecycle Active
        </span>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Incoming Orders"
          description="You haven't received any orders yet. Ensure your crops are published and listed in the marketplace to attract buyers."
          ctaText="Add Crop to List"
          ctaHref="/farmer/inventory"
        />
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => {
            const stage = getOrderStatusStage(order);
            
            // Stepper progress indicator mapping
            const stagesDef = [
              { key: 'pending', label: 'Pending' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'transit', label: 'In Transit' },
              { key: 'out_for_delivery', label: 'Out for Delivery' },
              { key: 'completed', label: 'Completed' }
            ];

            const currentIdx = stagesDef.findIndex(s => s.key === stage);

            return (
              <Card key={order._id} className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
                {/* Stepper Header */}
                {stage !== 'cancelled' && (
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-slate-400 mb-3">
                      <span>ORDER STAGE: {stage.toUpperCase().replace(/_/g, ' ')}</span>
                      <span>ID: #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between w-full relative">
                      {stagesDef.map((s, idx) => {
                        const isDone = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div key={s.key} className="flex flex-col items-center flex-1 z-10 relative">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isDone ? 'bg-green-600 text-white' :
                              isCurrent ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' :
                              'bg-slate-200 text-slate-500'
                            }`}>
                              {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <span className={`text-[10px] mt-1.5 font-medium hidden sm:inline ${
                              isCurrent ? 'text-slate-800 font-semibold' : 'text-slate-500'
                            }`}>{s.label}</span>
                          </div>
                        );
                      })}
                      {/* Connecting Line */}
                      <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-slate-200 -z-0">
                        <div 
                          className="h-full bg-green-600 transition-all duration-500" 
                          style={{ width: `${(Math.max(0, currentIdx) / (stagesDef.length - 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <CardContent className="p-6 space-y-6">
                  {/* Main Details Panel */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-900">{order.cropId?.name || 'Crop Name'}</span>
                        {stage === 'cancelled' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">REJECTED / CANCELLED</span>
                        )}
                      </div>
                      <div className="text-slate-600 space-y-1 text-sm">
                        <p className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-slate-400" /> Quantity ordered: <strong className="text-slate-800">{order.quantity} units</strong></p>
                        <p className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400" /> Buyer: <strong className="text-slate-800">{order.buyerId?.name || 'Anonymous'}</strong></p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-between border border-slate-100">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 block mb-1">TOTAL VALUATION</span>
                        <span className="text-2xl font-black text-emerald-600">₹{order.totalAmount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2 border-t border-slate-200/60 pt-2">
                        <span>Payment: {order.paymentStatus.toUpperCase()}</span>
                        <span>Delivery: {order.deliveryStatus.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Specific Instructions & Actions */}
                  <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Informative Text based on state */}
                    <div className="text-sm text-slate-600 flex-1">
                      {stage === 'pending' && (
                        <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-100">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <div>
                            <strong className="block">Awaiting Action</strong>
                            Please review buyer credentials and stock availability before accepting the order.
                          </div>
                        </div>
                      )}
                      {stage === 'accepted' && (
                        <p className="text-slate-500">
                          Prepare the harvest package. Ensure it is sorted, graded, and packed for logistics collection.
                        </p>
                      )}
                      {stage === 'scheduled' && (
                        <div className="space-y-1 bg-blue-50 p-3 rounded-md border border-blue-100 text-blue-900">
                          <p className="font-semibold flex items-center gap-1"><Truck className="w-4 h-4" /> Logistics Scheduled</p>
                          <p className="text-xs">Partner: <strong className="text-slate-800">{order.delivery?.logisticsPartnerId?.name || 'AgriBridge Express'}</strong></p>
                          <p className="text-xs">Driver Assignment: <strong className="text-slate-800">{order.delivery?.driverId?.name || 'Mohit Kumar (Driver)'}</strong></p>
                        </div>
                      )}
                      {stage === 'transit' && (
                        <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 text-indigo-900 text-xs space-y-1">
                          <p className="font-semibold flex items-center gap-1"><MapPin className="w-4 h-4" /> Transit Route Status</p>
                          <p>• Left Farm Depot $\rightarrow$ Nagpur Hub $\rightarrow$ Destination Center</p>
                          <p className="text-slate-500 font-medium">Driver: Moored near city bypass road. ETA ~2 hours.</p>
                        </div>
                      )}
                      {stage === 'out_for_delivery' && (
                        <div className="bg-emerald-50 p-3 rounded-md border border-emerald-100 text-emerald-950 text-xs">
                          <p className="font-semibold flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Out For Delivery</p>
                          <p>The driver has arrived at the destination. Please request the 6-digit payment code from the buyer to complete delivery verification.</p>
                        </div>
                      )}
                      {stage === 'completed' && (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-md border border-green-100 text-xs">
                          <Check className="w-4 h-4 shrink-0" />
                          <div>
                            <strong>Order Completed & Settled</strong>
                            <p className="text-slate-500 mt-0.5">Delivered on: {new Date(order.updatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      )}
                      {stage === 'cancelled' && (
                        <p className="text-red-500 flex items-center gap-1 text-xs">
                          <X className="w-4 h-4" /> Order was rejected and stock returned to listings.
                        </p>
                      )}
                    </div>

                    {/* Action buttons matching state */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {stage === 'pending' && (
                        <>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRejectOrder(order._id)}>
                            <X className="w-4 h-4 mr-1.5" /> Reject
                          </Button>
                          <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAcceptOrder(order._id)}>
                            <Check className="w-4 h-4 mr-1.5" /> Accept Order
                          </Button>
                        </>
                      )}
                      {stage === 'accepted' && (
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleMarkReady(order._id)}>
                          <Package className="w-4 h-4 mr-1.5" /> Ready for Pickup
                        </Button>
                      )}
                      {stage === 'scheduled' && (
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleDispatch(order._id)}>
                          <Truck className="w-4 h-4 mr-1.5" /> Dispatch Logistics Partner
                        </Button>
                      )}
                      {stage === 'transit' && (
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleOutForDelivery(order._id)}>
                          <MapPin className="w-4 h-4 mr-1.5" /> Out for Delivery
                        </Button>
                      )}
                      {stage === 'out_for_delivery' && (
                        <div className="flex flex-col gap-2 w-full max-w-[280px]">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Enter OTP" 
                              value={otpInputs[order._id] || ''}
                              className="w-24 text-center font-bold tracking-wider"
                              maxLength={6}
                              onChange={(e) => setOtpInputs({ ...otpInputs, [order._id]: e.target.value })}
                            />
                            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleVerifyCash(order._id)}>
                              Verify OTP
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <button className="text-[10px] text-indigo-600 hover:underline text-left font-medium" onClick={() => fetchDebugOtp(order._id)}>
                              🔑 Fetch Demo OTP
                            </button>
                            {demoOtps[order._id] && (
                              <span className="text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">
                                Code: {demoOtps[order._id]}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {stage === 'completed' && (
                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50" onClick={() => handleDownloadInvoice(order)}>
                          <Download className="w-4 h-4 mr-1.5" /> Invoice
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
