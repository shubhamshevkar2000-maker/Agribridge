'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  IndianRupee, 
  AlertTriangle,
  Gavel,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dashboard/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.message || 'Failed to fetch admin stats');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="glass-card border-border/50 animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="w-8 h-8 rounded-lg bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="glass-card border-border/50 lg:col-span-2 animate-pulse h-[380px]" />
          <Card className="glass-card border-border/50 animate-pulse h-[380px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center gap-4">
        <AlertTriangle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-heading font-bold">Failed to Load Dashboard</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button onClick={fetchStats} className="bg-primary hover:bg-primary/90 text-white gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center gap-2">
        <h2 className="text-2xl font-heading font-bold">No Data Available</h2>
        <p className="text-muted-foreground">There are currently no transactions or metrics on the platform.</p>
        <Button onClick={fetchStats} className="mt-4">Refresh</Button>
      </div>
    );
  }

  const kpis = [
    { title: 'Total GMV', value: `₹${data.totalGmv?.toLocaleString() || 0}`, icon: IndianRupee },
    { title: 'Platform Revenue', value: `₹${data.platformRevenue?.toLocaleString() || 0}`, icon: Activity },
    { title: 'Active Users', value: data.activeUsersCount?.toString() || '0', icon: Users },
    { title: 'Active Disputes', value: data.activeDisputes?.toString() || '0', icon: AlertTriangle, alert: data.activeDisputes > 0 },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <Card className={`glass-card border-border/50 ${kpi.alert ? 'border-destructive/50 bg-destructive/5' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <div className={`p-2 rounded-lg ${kpi.alert ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Analytics Chart */}
        <Card className="glass-card border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform GMV & Revenue</CardTitle>
            <CardDescription>Monthly aggregated transaction volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="GMV" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorGmv)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Queue */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Dispute Queue</CardTitle>
            <CardDescription>Escalated orders requiring admin mediation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.activeDisputes > 0 ? (
                <div className="p-4 rounded-xl border border-border/50 bg-secondary/30 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">Disputes Active</div>
                    <div className="text-xs text-muted-foreground">Orders flagged for mediation</div>
                  </div>
                  <Badge variant="outline" className="text-destructive border-destructive/30">
                    HIGH SEVERITY
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border/50 rounded-xl bg-secondary/20">
                  No active disputes requiring review.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
