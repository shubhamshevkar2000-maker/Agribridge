'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handlePayCash = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${orderId}/pay-cash`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('OTP has been generated and sent to the farmer (check server console).');
        fetchOrders();
      } else {
        alert(data.message || 'Error triggering cash payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-heading font-bold">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">You have no orders yet.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{order.cropId?.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                  <p><strong>Farmer:</strong> {order.farmerId?.name}</p>
                  <p><strong>Status:</strong> {order.paymentStatus}</p>
                </div>
                <div>
                  {order.paymentStatus === 'pending' && (
                    <Button onClick={() => handlePayCash(order._id)}>
                      Pay via Cash (Send OTP)
                    </Button>
                  )}
                  {order.paymentStatus === 'completed' && (
                    <span className="text-green-500 font-bold">Paid</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
