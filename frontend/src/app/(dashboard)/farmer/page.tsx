'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  Gavel, 
  TrendingUp, 
  ShieldCheck, 
  CloudRain, 
  Cpu, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock Gemini AI Stub
const askKrishiSathi = async (prompt: string) => {
  // Simulate Gemini API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  return `Based on current market data and your region, ${prompt.includes('price') ? 'the suggested price for Tomatoes is ₹2,200/qtl, up 5% from last week.' : 'heavy rainfall is expected in 2 days. Consider delaying your harvest.'}`;
};

const kpis = [
  { title: "Today's Revenue", value: "₹24,500", icon: IndianRupee, trend: "+12%", trendUp: true },
  { title: "Active Auctions", value: "3", icon: Gavel, trend: "+1 new", trendUp: true },
  { title: "Trust Score", value: "850", icon: ShieldCheck, trend: "Excellent", trendUp: true },
  { title: "Credit Score", value: "720", icon: TrendingUp, trend: "+15 pts", trendUp: true },
];

export default function FarmerDashboard() {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSuggestPrice = async () => {
    setIsAiLoading(true);
    const res = await askKrishiSathi('suggest price for tomato');
    setAiResponse(res);
    setIsAiLoading(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="glass-card border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <kpi.icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-heading font-bold text-foreground">{kpi.value}</div>
                <div className={`text-xs mt-1 font-medium ${kpi.trendUp ? 'text-primary' : 'text-destructive'}`}>
                  {kpi.trend} from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed / Auctions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-xl flex items-center justify-between">
                Live Auctions
                <Badge variant="destructive" className="animate-pulse">1 LIVE</Badge>
              </CardTitle>
              <CardDescription>Monitor your ongoing crop auctions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div className="w-full sm:w-32 h-32 bg-secondary rounded-lg object-cover overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&q=80" alt="Tomatoes" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg">Premium Grade Tomatoes</h3>
                    <p className="text-sm text-muted-foreground">50 Quintals • Organic</p>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current Highest Bid</div>
                      <div className="text-2xl font-bold text-primary">₹2,350<span className="text-sm font-normal">/qtl</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-destructive font-semibold mb-1">00:45:12 Left</div>
                      <Button size="sm" className="bg-primary-gradient">View Live <ArrowRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI & Weather Panel */}
        <div className="space-y-6">
          {/* Weather Widget */}
          <Card className="glass-card border-border/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-blue-500" /> Weather Advisory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl font-heading font-bold">28°C</div>
                <div className="text-sm font-medium text-blue-600 dark:text-blue-400">80% Rain Chance</div>
              </div>
              <div className="p-3 bg-background/50 rounded-lg text-sm border border-border/50 text-foreground">
                <strong>AI Alert:</strong> Heavy rain expected in your district within 48 hours. Consider harvesting ripe crops early.
              </div>
            </CardContent>
          </Card>

          {/* AI Tips Panel */}
          <Card className="glass-card border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Cpu className="w-24 h-24 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" /> KrishiSathi AI
              </CardTitle>
              <CardDescription>Smart insights for your farm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-secondary/50 rounded-lg text-sm border border-border/50">
                Your tomato inventory is ready for sale. Market demand in Mumbai is currently high.
              </div>
              
              {aiResponse ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 bg-primary/10 rounded-lg text-sm border border-primary/20 text-foreground"
                >
                  {aiResponse}
                </motion.div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full glass bg-background/50 text-primary border-primary/20 hover:bg-primary/10"
                  onClick={handleSuggestPrice}
                  disabled={isAiLoading}
                >
                  {isAiLoading ? 'Analyzing market data...' : 'Suggest Optimal Price'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
