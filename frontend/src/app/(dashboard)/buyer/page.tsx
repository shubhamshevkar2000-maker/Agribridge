'use client';

import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  MapPin, 
  Heart,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Gavel,
  CheckCircle,
  Truck,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BuyerDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/dashboard/buyer`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Error fetching buyer dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const {
    totalSpent = 0,
    activeOrdersCount = 0,
    activeBidsCount = 0,
    recentPurchases = [],
    deliveries = [],
    recommendedCrops = []
  } = data || {};

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto p-4 md:p-6">
      
      {/* Welcome & Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Sourcing Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage orders, track deliveries, and participate in live auctions.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link href="/buyer/marketplace">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><ShoppingBag className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              {activeOrdersCount === 0 ? (
                <>
                  <div className="text-3xl font-heading font-bold">0</div>
                  <div className="text-xs mt-1 font-medium text-muted-foreground">No active orders.</div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-heading font-bold">{activeOrdersCount}</div>
                  <div className="text-xs mt-1 font-medium text-primary">In transit & processing</div>
                </>
              )}
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
              <div className="text-3xl font-heading font-bold">₹{totalSpent.toLocaleString()}</div>
              <div className="text-xs mt-1 font-medium text-muted-foreground">Completed payments</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Bids</CardTitle>
              <div className="p-2 bg-destructive/10 rounded-lg text-destructive"><Gavel className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              {activeBidsCount === 0 ? (
                <>
                  <div className="text-3xl font-heading font-bold">0</div>
                  <div className="text-xs mt-1 font-medium text-muted-foreground">No bids placed yet.</div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-heading font-bold">{activeBidsCount}</div>
                  <div className="text-xs mt-1 font-medium text-destructive">In live auctions</div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Purchases */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-border/50 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-heading text-xl">Recent Purchases</CardTitle>
                <CardDescription>Order fulfillment logs</CardDescription>
              </div>
              <Link href="/buyer/orders">
                <Button variant="outline" size="sm" className="rounded-xl">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 border-t border-border/50">
              {recentPurchases.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-secondary/20">
                      <TableRow>
                        <TableHead className="pl-6 py-4">Order ID</TableHead>
                        <TableHead>Crop</TableHead>
                        <TableHead>Farmer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="pr-6">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentPurchases.map((order: any) => (
                        <TableRow key={order._id} className="hover:bg-secondary/10 transition-colors">
                          <TableCell className="pl-6 py-4 font-medium text-primary">#{order._id.substring(0, 8)}</TableCell>
                          <TableCell className="font-semibold">{order.cropId?.name || 'Crop'}</TableCell>
                          <TableCell>{order.farmerId?.name || 'N/A'}</TableCell>
                          <TableCell className="font-semibold text-foreground">₹{order.totalAmount}</TableCell>
                          <TableCell className="pr-6">
                            <Badge variant={order.status === 'Completed' ? 'default' : 'secondary'} className="rounded-lg">
                              {order.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-muted-foreground/45" />
                  <h4 className="font-semibold text-base text-foreground">No purchases made yet.</h4>
                  <p className="text-sm mt-1">Search the marketplace to buy crops directly from farmers.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Crops */}
          <Card className="glass-card border-border/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="font-heading text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Recommended Crops
              </CardTitle>
              <CardDescription>Premium fresh listings matched to your role</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendedCrops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedCrops.map((crop: any) => (
                    <div key={crop._id} className="p-4 rounded-xl border border-border/50 hover:border-primary/45 hover:bg-primary/5 transition-all flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-base truncate group-hover:text-primary transition-colors">{crop.name}</h4>
                          {crop.isOrganic && (
                            <Badge variant="outline" className="text-[10px] h-4 bg-green-500/10 text-green-600 border-green-500/20">Organic</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{crop.quantity} {crop.unit} available</p>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-border/30">
                        <span className="font-bold text-foreground">₹{crop.pricePerUnit}<span className="text-[10px] font-normal text-muted-foreground">/{crop.unit}</span></span>
                        <Link href={`/buyer/marketplace`}>
                          <Button size="icon" className="h-7 w-7 bg-primary hover:bg-primary/90 text-white rounded-lg">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-xl">
                  No recommendations yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Delivery Status & Actions */}
        <div className="space-y-6">
          {/* Active Deliveries */}
          <Card className="glass-card border-border/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" /> Delivery Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deliveries.length > 0 ? (
                <div className="space-y-4">
                  {deliveries.map((delivery: any) => (
                    <div key={delivery._id} className="p-4 bg-secondary/30 rounded-xl border border-border/50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm truncate max-w-[160px]">{delivery.orderId?.cropId?.name || 'Crop Shipments'}</h4>
                          <span className="text-xs text-muted-foreground">ID: #{delivery._id.substring(0, 8)}</span>
                        </div>
                        <Badge className="bg-primary/10 text-primary capitalize text-[10px] border-transparent shadow-none">
                          {delivery.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> 
                        <span>Updated: {new Date(delivery.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border/50 rounded-xl">
                  No deliveries.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card border-border/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground leading-relaxed">
                "Ask me about crop availability, pricing trends, or transaction logistics."
              </div>
              <Link href="/buyer/ai">
                <Button className="w-full bg-primary-gradient text-white rounded-xl flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Ask KrishiSathi
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
