'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  ListCollapse, 
  Gavel, 
  Truck, 
  Percent, 
  Loader2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface AnalyticsData {
  totalRevenue: number;
  monthlySales: number;
  topSellingCrop: string;
  inventoryValue: number;
  ordersCompleted: number;
  activeListings: number;
  deliverySuccessRate: number;
  averageAuctionPrice: number;
}

export default function FarmerAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await api.get('/api/analytics/farmer');
      if (d.success) {
        setData(d.data);
      } else {
        setError(new Error('Failed to load analytics data'));
      }
    } catch (err) {
      console.error('Error fetching farmer analytics:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4 font-medium">Computing live analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold text-destructive">Failed to load analytics</h2>
        <p className="text-muted-foreground mt-2">Please check your connection and try again.</p>
        <Button onClick={fetchAnalytics} className="mt-4">Retry</Button>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${data?.totalRevenue?.toLocaleString() || 0}`,
      desc: data?.totalRevenue && data.totalRevenue > 0 ? 'All-time completed sales volume' : 'No completed sales yet.',
      icon: DollarSign,
      color: 'from-emerald-500/10 to-emerald-500/5 text-emerald-500 border-emerald-500/20'
    },
    {
      title: 'Monthly Sales',
      value: `₹${data?.monthlySales?.toLocaleString() || 0}`,
      desc: 'Completed sales in current month',
      icon: Calendar,
      color: 'from-teal-500/10 to-teal-500/5 text-teal-500 border-teal-500/20'
    },
    {
      title: 'Top Selling Crop',
      value: data?.topSellingCrop || 'No sales data available.',
      desc: 'Crop with highest volume sold',
      icon: Award,
      color: 'from-amber-500/10 to-amber-500/5 text-amber-500 border-amber-500/20'
    },
    {
      title: 'Inventory Value',
      value: `₹${data?.inventoryValue?.toLocaleString() || 0}`,
      desc: 'Estimated value of unsold stock',
      icon: Layers,
      color: 'from-blue-500/10 to-blue-500/5 text-blue-500 border-blue-500/20'
    },
    {
      title: 'Orders Completed',
      value: data?.ordersCompleted || 0,
      desc: 'Total successfully shipped orders',
      icon: ShoppingBag,
      color: 'from-violet-500/10 to-violet-500/5 text-violet-500 border-violet-500/20'
    },
    {
      title: 'Active Listings',
      value: data?.activeListings || 0,
      desc: 'Crops currently visible to buyers',
      icon: Package,
      color: 'from-indigo-500/10 to-indigo-500/5 text-indigo-500 border-indigo-500/20'
    },
    {
      title: 'Delivery Success Rate',
      value: data?.deliverySuccessRate !== null && data?.deliverySuccessRate !== undefined ? `${data.deliverySuccessRate}%` : 'Not Available',
      desc: 'On-time delivery percentage',
      icon: Truck,
      color: 'from-sky-500/10 to-sky-500/5 text-sky-500 border-sky-500/20'
    },
    {
      title: 'Avg Auction Price',
      value: data?.averageAuctionPrice !== null && data?.averageAuctionPrice !== undefined ? `₹${data.averageAuctionPrice.toLocaleString()}` : 'Not Available',
      desc: 'Average bid price in auctions',
      icon: Gavel,
      color: 'from-rose-500/10 to-rose-500/5 text-rose-500 border-rose-500/20'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-primary" /> Analytics & Insights
        </h1>
        <p className="text-muted-foreground">Real-time performance metrics computed from your store activities.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`glass-card border/50 bg-gradient-to-br ${stat.color} rounded-2xl hover:scale-[1.02] transition-transform overflow-hidden relative group`}>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</span>
                    <div className="p-2 rounded-xl bg-background border border-border/30">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-2xl font-bold font-heading">{stat.value}</span>
                    <span className="text-xs text-muted-foreground block mt-1.5 font-medium">{stat.desc}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Performance Radar */}
        <Card className="glass-card border-border/50 rounded-3xl p-6">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-border/50">
            <CardTitle className="text-lg font-bold font-heading">Delivery Status Audit</CardTitle>
            <CardDescription>Visual summary of order fulfillment accuracy.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-6 flex flex-col justify-center items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-muted/20"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-primary"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${(data?.deliverySuccessRate !== null && data?.deliverySuccessRate !== undefined ? data.deliverySuccessRate : 0) * 2.51} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">
                  {data?.deliverySuccessRate !== null && data?.deliverySuccessRate !== undefined ? `${data.deliverySuccessRate}%` : 'N/A'}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Success</span>
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground mt-6 max-w-sm">
              Keep your success rate above <span className="font-semibold text-primary">95%</span> to qualify for low-interest agri-credit loans.
            </p>
          </CardContent>
        </Card>

        {/* Sales & Stock Performance Summary */}
        <Card className="glass-card border-border/50 rounded-3xl p-6">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-border/50">
            <CardTitle className="text-lg font-bold font-heading">Capital Allocation Summary</CardTitle>
            <CardDescription>Value allocation across listings, revenue, and pending bids.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Monthly Revenue Target (₹50,000)</span>
                <span className="font-semibold">{Math.min(Math.round(((data?.monthlySales || 0) / 50000) * 100), 100)}%</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(Math.round(((data?.monthlySales || 0) / 50000) * 100), 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Total Capital Value (Inventory vs Sales)</span>
                <span className="font-semibold">₹{(data?.totalRevenue || 0) + (data?.inventoryValue || 0)}</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${((data?.totalRevenue || 0) / ((data?.totalRevenue || 0.1) + (data?.inventoryValue || 0))) * 100}%` }}
                  title="Completed Sales"
                />
                <div 
                  className="h-full bg-blue-500 transition-all duration-500" 
                  style={{ width: `${((data?.inventoryValue || 0) / ((data?.totalRevenue || 0.1) + (data?.inventoryValue || 0))) * 100}%` }}
                  title="Unsold Inventory"
                />
              </div>
              <div className="flex gap-4 text-xs mt-1">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Sales
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Inventory
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
