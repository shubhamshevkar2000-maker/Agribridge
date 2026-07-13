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

// Mock Data matching schema expectations
const mockOrders = [
  { id: 'ORD-8921', date: '2026-07-12', crop: 'Premium Tomatoes', farmer: 'Ramesh Kumar', qty: '50 Qtl', amount: '₹1,17,500', status: 'In Transit' },
  { id: 'ORD-8910', date: '2026-07-10', crop: 'Organic Wheat', farmer: 'Suresh Patel', qty: '200 Qtl', amount: '₹4,50,000', status: 'Delivered' },
  { id: 'ORD-8855', date: '2026-07-05', crop: 'Basmati Rice', farmer: 'Anil Desai', qty: '100 Qtl', amount: '₹3,20,000', status: 'Delivered' },
];

const mockFavorites = [
  { id: 1, name: 'Ramesh Kumar', location: 'Nashik, MH', crops: 'Tomatoes, Onions', trustScore: 850 },
  { id: 2, name: 'Suresh Patel', location: 'Surat, GJ', crops: 'Wheat, Cotton', trustScore: 920 },
];

export default function BuyerDashboard() {
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
              <div className="text-3xl font-heading font-bold">12</div>
              <div className="text-xs mt-1 font-medium text-primary">3 Arriving today</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent (YTD)</CardTitle>
              <div className="p-2 bg-accent/10 rounded-lg text-accent"><TrendingUp className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold">₹1.2 Cr</div>
              <div className="text-xs mt-1 font-medium text-primary">+15% vs Last Year</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Favorite Farmers</CardTitle>
              <div className="p-2 bg-destructive/10 rounded-lg text-destructive"><Heart className="w-4 h-4" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-heading font-bold">24</div>
              <div className="text-xs mt-1 font-medium text-muted-foreground">Across 5 States</div>
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
                <CardDescription>Your latest orders (Using mock data until Phase 6)</CardDescription>
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
                    {mockOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-primary">{order.id}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <div>{order.crop}</div>
                          <div className="text-xs text-muted-foreground">by {order.farmer} • {order.qty}</div>
                        </TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'Delivered' ? 'default' : 'secondary'} className={order.status === 'Delivered' ? 'bg-primary' : ''}>
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
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
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <div className="font-bold">ORD-8921</div>
                    <div className="text-sm text-muted-foreground">Arriving Today, 4:00 PM</div>
                  </div>
                  <Badge className="bg-primary">In Transit</Badge>
                </div>
                
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-primary border border-primary/30 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">Current Location</div>
                      <div className="text-xs text-muted-foreground">30km away from destination</div>
                    </div>
                  </div>
                </div>

                {/* Decorative Map Pattern Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Favorite Farmers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockFavorites.map((farmer) => (
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
              ))}
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
