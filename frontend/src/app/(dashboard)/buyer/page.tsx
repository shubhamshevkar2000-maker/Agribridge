'use client';

import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Heart,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useState, useEffect } from 'react';

export default function BuyerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isDeliveriesLoading, setIsDeliveriesLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dashboard/buyer`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setDashboardData(json.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDeliveries = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/deliveries`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setDeliveries(json.data);
        }
      } catch (err) {
        console.error("Error fetching deliveries:", err);
      } finally {
        setIsDeliveriesLoading(false);
      }
    };

    fetchDashboard();
    fetchDeliveries();
  }, []);
  const favorites = dashboardData?.favorites || [];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><ShoppingBag className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold">{dashboardData?.recentOrders?.length || 0}</div>
              <div className="text-xs mt-1 font-medium text-primary">In Transit</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              <div className="p-2 bg-accent/10 rounded-lg text-accent"><TrendingUp className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold">₹{dashboardData?.totalSpent?.toLocaleString() || 0}</div>
              <div className="text-xs mt-1 font-medium text-primary">Current Financial Year</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Bids</CardTitle>
              <div className="p-2 bg-destructive/10 rounded-lg text-destructive"><Heart className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold">{dashboardData?.activeBidsCount || 0}</div>
              <div className="text-xs mt-1 font-medium text-muted-foreground">Live Auctions</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Purchase History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading text-xl">Recent Purchases</CardTitle>
                <CardDescription>Your latest orders</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-secondary/30">
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell>
                      </TableRow>
                    ) : dashboardData?.recentOrders?.length > 0 ? (
                      dashboardData.recentOrders.map((order: any) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium text-primary">{order._id.substring(0, 8)}</TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{order.cropId || 'Crop'}</TableCell>
                          <TableCell>₹{order.totalAmount}</TableCell>
                          <TableCell>
                            <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                          <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No recent purchases found.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Farmers & Quick Tracking */}
        <div className="space-y-6">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Delivery Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDeliveriesLoading ? (
                <div className="text-center py-4 text-muted-foreground text-sm">Loading tracker...</div>
              ) : deliveries.length > 0 ? (
                <div className="space-y-4">
                  {deliveries.slice(0, 1).map((delivery: any) => (
                    <div key={delivery._id} className="p-4 bg-primary/5 rounded-xl border border-primary/20 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <div className="font-bold uppercase text-sm truncate max-w-[150px]">
                            {delivery.orderId?.cropId?.name || 'Crop Delivery'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Status: {delivery.status.replace('_', ' ')}
                          </div>
                        </div>
                        <Badge className="bg-primary uppercase text-[10px]">
                          {delivery.status}
                        </Badge>
                      </div>
                      
                      <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-primary border border-primary/30 shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-xs">Estimated Arrival</div>
                            <div className="text-xs text-muted-foreground">
                              {delivery.status === 'delivered' ? 'Delivered successfully' : 'In transit to destination'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border/50 rounded-xl bg-secondary/20">
                  No active crop shipments to track.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Favorite Farmers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {favorites.length > 0 ? (
                favorites.map((farmer: any) => (
                  <div key={farmer.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {farmer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{farmer.name}</div>
                        <div className="text-xs text-muted-foreground">{farmer.location}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">No favorite farmers yet.</p>
                </div>
              )}
              <Button variant="outline" className="w-full text-primary border-primary/20 bg-primary/5 hover:bg-primary/10">
                Browse More Farmers
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
