'use client';

import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle,
  Truck,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useState, useEffect } from 'react';

// Mock Stops fallback, now handled via state
// const stops = [];

export default function LogisticsDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/deliveries/pool`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success) {
          setDashboardData(json.data);
        }
      } catch (err) {
        console.error("Error fetching pools:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPools();
  }, []);

  const pools = dashboardData || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
      
      {/* Left Column: Itinerary */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 pr-2 pb-8">
        
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-heading">
              {pools.length > 0 ? `${pools.length} Suggested Pools` : 'No Active Routes'}
            </CardTitle>
            <CardDescription>{pools.length > 0 ? 'Cost-sharing pooled routes' : 'No pending deliveries to pool'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {pools.length > 0 && (
              <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-xl border border-border/50">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Vehicle: Pooled Truck</div>
                  <div className="text-xs text-muted-foreground">Driver: Route Assigned</div>
                </div>
              </div>
            )}

            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading pools...</div>
              ) : pools.length > 0 ? (
                pools.map((pool: any, index: number) => (
                  <div key={pool.poolId} className="relative z-10 flex flex-col gap-2 mb-6">
                    <div className="flex items-center gap-2 font-bold text-lg mb-2">
                      <Truck className="text-primary w-5 h-5" /> Pool #{index + 1}
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Total Vol: {pool.totalQuantity} units</span>
                      <span>Est. Cost: ₹{pool.estimatedTotalCost.toFixed(2)}</span>
                    </div>
                    {pool.orders.map((o: any) => (
                      <div key={o.orderId} className={`flex flex-col flex-1 p-4 rounded-xl border bg-background border-border/50`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className={`font-semibold text-foreground`}>
                            {o.crop?.name} (Farmer: {o.farmer?.name})
                          </div>
                          <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                            PICKUP
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Qty: {o.quantity}</span>
                          <span className="font-bold text-primary">Split Cost: ₹{o.costShare.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border/50 bg-secondary/20">
                  <Navigation className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold mb-1">No Active Deliveries</h3>
                  <p className="text-sm text-muted-foreground mb-4">You have no upcoming stops in your itinerary.</p>
                </div>
              )}

            </div>
          </CardContent>
        </Card>

      </div>

      {/* Right Column: Interactive Map Mock */}
      <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-[500px] overflow-hidden rounded-3xl border border-border/50 bg-secondary/20 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20 dark:opacity-5 mix-blend-overlay pointer-events-none" />
        
        {pools.length > 0 ? (
          <>
            {/* Mock Map UI overlay */}
            <div className="absolute top-4 left-4 z-10 glass-card p-4 rounded-xl border border-border/50 shadow-lg">
              <h3 className="font-heading font-bold mb-1">Live Tracking</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-blue-500" /> Navigating to next stop
              </p>
            </div>

            <div className="absolute bottom-4 right-4 z-10">
              <Button className="bg-primary-gradient shadow-lg">
                <Navigation className="w-4 h-4 mr-2" /> Open in Maps
              </Button>
            </div>

            {/* Central Map Illustration Mock */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
               {/* Connecting Line */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                 <path d="M 30% 40% Q 50% 20% 70% 60%" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
               </svg>
               
               <motion.div 
                 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                 className="absolute left-[30%] top-[40%] w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-lg -translate-x-1/2 -translate-y-1/2"
               >
                 <CheckCircle className="w-4 h-4" />
               </motion.div>

               <motion.div 
                 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
                 className="absolute left-[50%] top-[30%] w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] -translate-x-1/2 -translate-y-1/2 animate-bounce"
               >
                 <Truck className="w-4 h-4" />
               </motion.div>

               <motion.div 
                 initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }}
                 className="absolute left-[70%] top-[60%] w-6 h-6 rounded-full bg-background border-4 border-destructive shadow-lg -translate-x-1/2 -translate-y-1/2"
               />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MapPin className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-heading font-bold mb-2">Map Unavailable</h3>
            <p className="text-muted-foreground max-w-sm">
              Your map will appear here once you have an active route assigned to your fleet.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
