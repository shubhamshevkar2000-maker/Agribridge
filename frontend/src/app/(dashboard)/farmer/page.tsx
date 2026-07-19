'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { 
  IndianRupee, Gavel, TrendingUp, ShieldCheck, CloudRain, Cpu, Sparkles,
  ArrowRight, Package, Store, Truck, MapPin, Bell, Calendar, Plus, Clock, History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { CropImage } from '@/components/ui/crop-image';

import { api } from '@/lib/api';

const fetcher = (url: string) => api.get(url);

const askKrishiSathi = async (prompt: string) => {
  try {
    const data = await api.post(`/api/ai/insights`, { prompt, language: 'en' });
    if (data.success) return data.data.response;
    return "Failed to get insights.";
  } catch (error) {
    return "Failed to reach KrishiSathi AI.";
  }
};

const SkeletonCard = () => (
  <Card className="glass-card animate-pulse">
    <CardHeader className="pb-2"><div className="h-4 bg-muted w-1/2 rounded" /></CardHeader>
    <CardContent><div className="h-10 bg-muted w-3/4 rounded mb-2" /><div className="h-3 bg-muted w-1/3 rounded" /></CardContent>
  </Card>
);

export default function FarmerDashboard() {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch Core Dashboard Data (SWR with auto-refresh every 30s)
  const { data: dashboard, error: dashboardError, isLoading: dashboardLoading, mutate: mutateDashboard } = useSWR('/api/dashboard/farmer', fetcher, { refreshInterval: 30000 });
  const { data: weather, isLoading: weatherLoading } = useSWR('/api/weather/farmer', fetcher, { refreshInterval: 3600000 });

  const handleSuggestPrice = async () => {
    setIsAiLoading(true);
    const res = await askKrishiSathi('Suggest market insights and weather warnings based on my farm data.');
    setAiResponse(res);
    setIsAiLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (dashboardLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }

  if (dashboardError || !dashboard?.success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold text-destructive">Failed to load dashboard</h2>
        <p className="text-muted-foreground mt-2">Please check your connection and try again.</p>
        <Button onClick={() => mutateDashboard()} className="mt-4">Retry</Button>
      </div>
    );
  }

  const {
    farmer, walletBalance, trustScore, creditScore, revenue, inventory,
    myListings, auctions, deliveries, notifications, recentActivity
  } = dashboard.data;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-primary/10 to-transparent p-6 rounded-2xl border border-primary/20">
        <div className="flex items-center gap-4">
          <img src={farmer.profileImage} alt={farmer.name} className="w-16 h-16 rounded-full border-2 border-primary/50 shadow-sm" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {getGreeting()}, {farmer.name}!
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {farmer.village}, {farmer.district}, {farmer.state}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-sm text-muted-foreground">Wallet Balance</p>
          <p className="text-3xl font-bold text-primary">₹{(walletBalance || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Grid for KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 2. Revenue Card */}
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><IndianRupee className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            {revenue.monthly === 0 ? (
              <>
                <div className="text-2xl font-bold">₹0</div>
                <p className="text-xs text-muted-foreground mt-1">No sales yet.</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">₹{revenue.monthly.toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground mt-1">Today: ₹{revenue.today.toLocaleString('en-IN')}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* 3. Inventory Card */}
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Package className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            {inventory.totalCrops === 0 ? (
              <>
                <div className="text-2xl font-bold">0 Crops</div>
                <p className="text-xs text-muted-foreground mt-1">No crops added.</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{inventory.totalCrops} Crops</div>
                <p className="text-xs text-muted-foreground mt-1">{inventory.availableStock} total units</p>
                {inventory.lowStock > 0 && <p className="text-xs text-destructive font-medium mt-1">{inventory.lowStock} items low on stock</p>}
              </>
            )}
          </CardContent>
        </Card>

        {/* 4. My Listings Card */}
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">My Listings</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Store className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            {myListings.activeCount === 0 ? (
              <>
                <div className="text-2xl font-bold">0 Active</div>
                <p className="text-xs text-muted-foreground mt-1">No listings available.</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{myListings.activeCount} Active</div>
                <p className="text-xs text-muted-foreground mt-1">{myListings.draftCount} drafts, {myListings.soldCount} sold</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* 5. Delivery Card */}
        <Card className="glass-card">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Truck className="w-4 h-4" /></div>
          </CardHeader>
          <CardContent>
            {deliveries.inTransit === 0 && deliveries.pending === 0 && deliveries.delivered === 0 ? (
              <>
                <div className="text-2xl font-bold">0 Deliveries</div>
                <p className="text-xs text-muted-foreground mt-1">No deliveries.</p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{deliveries.inTransit} In Transit</div>
                <p className="text-xs text-muted-foreground mt-1">{deliveries.pending} pending, {deliveries.pickedUp} picked up</p>
                <div className="mt-2 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full" style={{ width: `${(deliveries.delivered / (deliveries.pending + deliveries.inTransit + deliveries.delivered + 0.01)) * 100}%` }} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Center Column: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 12. Quick Actions */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <Link href="/farmer/inventory">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Add Crop
              </Button>
            </Link>
            <Link href="/farmer/auctions">
              <Button variant="outline" className="bg-background">
                <Gavel className="w-4 h-4 mr-2 text-amber-500" /> Start Auction
              </Button>
            </Link>
            <Link href="/farmer/deliveries">
              <Button variant="outline" className="bg-background">
                <Truck className="w-4 h-4 mr-2 text-purple-500" /> Track Deliveries
              </Button>
            </Link>
            <Link href="/farmer/credit">
              <Button variant="outline" className="bg-background">
                <ShieldCheck className="w-4 h-4 mr-2 text-blue-500" /> Apply Loan
              </Button>
            </Link>
          </div>

          {/* 5. Active Auctions Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex justify-between items-center text-lg">
                My Live Auctions
                <Badge variant={auctions.count > 0 ? "destructive" : "secondary"}>
                  {auctions.count} LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auctions.live.length > 0 ? (
                auctions.live.slice(0, 3).map((auction: any) => (
                  <div key={auction._id} className="flex justify-between items-center p-4 bg-secondary/30 rounded-xl mb-3 border border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <CropImage 
                          images={auction.cropId?.images} 
                          alt={auction.cropId?.name || "Crop"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold">{auction.cropId?.name || "Crop"}</h4>
                        <p className="text-sm text-muted-foreground">Ends in: {Math.max(0, Math.round((new Date(auction.endTime).getTime() - Date.now()) / 3600000))} hrs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Highest Bid</div>
                      <div className="font-bold text-primary">₹{auction.currentHighestBid || auction.startingBid}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed">
                  No active auctions.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 11. Recent Activity */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><History className="w-5 h-5" /> Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 pr-4">
                <div className="space-y-4">
                  {recentActivity.map((activity: any, i: number) => (
                    <div key={i} className="flex gap-4 relative">
                      {i !== recentActivity.length - 1 && <div className="absolute top-8 left-[11px] bottom-[-16px] w-[2px] bg-border" />}
                      <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary z-10 flex-shrink-0" />
                      <div className="pb-4">
                        <p className="text-sm font-medium">Payment received from {activity.payerId?.name || 'Buyer'}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                        <p className="text-sm font-bold text-green-500 mt-1">+₹{activity.amount}</p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && <p className="text-muted-foreground text-sm text-center">No recent activity found.</p>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* 7. AgriCredit Card */}
          <Card className="glass-card bg-gradient-to-br from-indigo-500/10 to-blue-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-500" /> Credit & Trust</CardTitle>
            </CardHeader>
            <CardContent>
              {creditScore === 0 ? (
                <div>
                  <p className="text-xs text-muted-foreground">Credit Score</p>
                  <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">Not calculated yet</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Complete your first successful sale to generate your Credit Score.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Credit Score</p>
                      <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{creditScore}</h3>
                    </div>
                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-500 border-indigo-200">Calculated</Badge>
                  </div>
                  <Progress value={creditScore / 10} className="h-2 mb-4" />
                </div>
              )}
              
              <div className="flex justify-between text-sm mt-4 pt-4 border-t border-border/50">
                {trustScore === 0 ? (
                  <span className="text-muted-foreground text-xs leading-normal">
                    Trust Score: <strong>No trust history</strong>. Complete deliveries and receive ratings to build your Trust Score.
                  </span>
                ) : (
                  <>
                    <span className="text-muted-foreground">Trust Score: <strong>{trustScore}</strong></span>
                    <span className="text-green-500 font-medium">+15 pts</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 8. Weather Card */}
          <Card className="glass-card relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><CloudRain className="w-24 h-24 text-blue-500" /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-blue-500"><CloudRain className="w-5 h-5" /> Local Weather</CardTitle>
            </CardHeader>
            <CardContent>
              {weatherLoading ? (
                <div className="text-sm text-muted-foreground py-4">Fetching weather data...</div>
              ) : weather?.success ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-4xl font-heading font-bold">{Math.round(weather.data.current.temp)}°C</div>
                    <div className="text-sm font-medium capitalize text-right">
                      {weather.data.current.description}
                      <p className="text-xs text-muted-foreground mt-1">Humidity: {weather.data.current.humidity}%</p>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg text-sm text-blue-700 dark:text-blue-300 font-medium">
                    {weather.data.forecast[0]?.rainChance > 50 ? 'High chance of rain coming up.' : 'Clear skies expected for the next 3 days.'}
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground py-4">Weather data unavailable for this region.</div>
              )}
            </CardContent>
          </Card>

          {/* 9. AI Insight Card */}
          <Card className="glass-card border-primary/30 shadow-lg shadow-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-primary"><Sparkles className="w-5 h-5" /> KrishiSathi AI</CardTitle>
              <CardDescription>Personalized farm insights</CardDescription>
            </CardHeader>
            <CardContent>
              {aiResponse ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-primary/10 rounded-lg text-sm text-foreground mb-4">
                  {aiResponse}
                </motion.div>
              ) : (
                <div className="p-3 bg-secondary/50 rounded-lg text-sm border border-border/50 mb-4">
                  Based on recent orders, Tomato prices are up 15%. Consider starting an auction this weekend to maximize profits.
                </div>
              )}
              <Button onClick={handleSuggestPrice} disabled={isAiLoading} className="w-full bg-primary-gradient">
                {isAiLoading ? 'Analyzing data...' : 'Generate New Insight'}
              </Button>
            </CardContent>
          </Card>

          {/* 10. Notifications */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                <span className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</span>
                {notifications.unreadCount > 0 && <Badge className="bg-destructive">{notifications.unreadCount}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {notifications.list.slice(0, 4).map((notif: any) => (
                <div key={notif._id} className="flex gap-3 items-start pb-3 border-b border-border/50 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${notif.isRead ? 'bg-muted' : 'bg-primary animate-pulse'}`} />
                  <div>
                    <p className={`text-sm ${notif.isRead ? 'text-muted-foreground' : 'font-medium'}`}>{notif.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5"><Clock className="w-3 h-3 inline mr-1" />{new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              ))}
              {notifications.list.length === 0 && <p className="text-sm text-muted-foreground text-center">No new notifications.</p>}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
