'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/orders', {
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

  const handleVerifyCash = async (orderId: string) => {
    const otp = otpInputs[orderId];
    if (!otp) {
      return alert('Please enter OTP');
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/verify-cash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (data.success) {
        alert('Payment verified! AgriCredit ledger updated.');
        fetchOrders();
      } else {
        alert(data.message || 'Error verifying payment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-heading font-bold">Incoming Orders</h1>
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
                  <p><strong>Buyer:</strong> {order.buyerId?.name}</p>
                  <p><strong>Status:</strong> {order.paymentStatus}</p>
                </div>
                <div>
                  {order.paymentStatus === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Input 
                        placeholder="Enter 6-digit OTP" 
                        value={otpInputs[order._id] || ''}
                        onChange={(e) => setOtpInputs({ ...otpInputs, [order._id]: e.target.value })}
                      />
                      <Button onClick={() => handleVerifyCash(order._id)}>
                        Confirm Cash Receipt
                      </Button>
                    </div>
                  )}
                  {order.paymentStatus === 'completed' && (
                    <span className="text-green-500 font-bold">Payment Verified</span>
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
