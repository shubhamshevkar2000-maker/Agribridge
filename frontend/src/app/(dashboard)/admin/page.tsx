'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  Activity, 
  IndianRupee, 
  AlertTriangle,
  Gavel
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
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Jan', GMV: 4000, Revenue: 240 },
  { name: 'Feb', GMV: 3000, Revenue: 139 },
  { name: 'Mar', GMV: 2000, Revenue: 980 },
  { name: 'Apr', GMV: 2780, Revenue: 390 },
  { name: 'May', GMV: 1890, Revenue: 480 },
  { name: 'Jun', GMV: 2390, Revenue: 380 },
  { name: 'Jul', GMV: 3490, Revenue: 430 },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total GMV', value: '₹1.25 Cr', icon: IndianRupee },
          { title: 'Platform Revenue', value: '₹1,25,000', icon: Activity },
          { title: 'Active Users', value: '1,420', icon: Users },
          { title: 'Active Disputes', value: '3', icon: AlertTriangle, alert: true },
        ].map((kpi, i) => (
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
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              {[
                { id: 'ORD-771', reason: 'Quality Mismatch', status: 'pending', severity: 'high' },
                { id: 'ORD-602', reason: 'Delayed Logistics', status: 'pending', severity: 'medium' },
                { id: 'ORD-899', reason: 'Payment Failed', status: 'pending', severity: 'high' },
              ].map((dispute) => (
                <div key={dispute.id} className="p-4 rounded-xl border border-border/50 bg-secondary/30 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{dispute.id}</div>
                    <div className="text-xs text-muted-foreground">{dispute.reason}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={dispute.severity === 'high' ? 'text-destructive border-destructive/30' : 'text-orange-500 border-orange-500/30'}>
                      {dispute.severity.toUpperCase()}
                    </Badge>
                    <Button size="sm" variant="link" className="h-auto p-0 text-primary font-medium text-xs">
                      Resolve <Gavel className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
