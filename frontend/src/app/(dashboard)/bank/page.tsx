'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  IndianRupee,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

// Mock Applications
const mockApplications = [
  { id: 'LN-1002', farmer: 'Suresh Patel', amount: 500000, purpose: 'Tractor Purchase', score: 850, risk: 'Low', status: 'pending' },
  { id: 'LN-1005', farmer: 'Vijay Singh', amount: 120000, purpose: 'Fertilizers & Seeds', score: 720, risk: 'Medium', status: 'pending' },
  { id: 'LN-1008', farmer: 'Kisan Mitra', amount: 800000, purpose: 'Drip Irrigation Setup', score: 540, risk: 'High', status: 'pending' },
];

export default function BankDashboard() {
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (status: 'approved' | 'rejected') => {
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 1000));
    setApplications(apps => apps.map(app => app.id === selectedApp.id ? { ...app, status } : app));
    setIsProcessing(false);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Disbursed', value: '₹4.2 Cr', icon: IndianRupee },
          { title: 'Active Loans', value: '1,250', icon: FileText },
          { title: 'Avg. Trust Score', value: '780', icon: ShieldCheck },
          { title: 'Recovery Rate', value: '98.5%', icon: TrendingUp },
        ].map((kpi, i) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
            <Card className="glass-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><kpi.icon className="w-4 h-4" /></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Loan Applications Table */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Pending Loan Applications</CardTitle>
          <CardDescription>Review applications powered by AgriBridge Trust Scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead>App ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Amount & Purpose</TableHead>
                  <TableHead>Trust Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.id}</TableCell>
                    <TableCell>{app.farmer}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-primary">₹{app.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{app.purpose}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{app.score}</span>
                        <Badge variant="outline" className={
                          app.risk === 'Low' ? 'text-green-500 border-green-500/30 bg-green-500/5' : 
                          app.risk === 'High' ? 'text-destructive border-destructive/30 bg-destructive/5' : 
                          'text-orange-500 border-orange-500/30 bg-orange-500/5'
                        }>
                          {app.risk} Risk
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        app.status === 'approved' ? 'bg-green-500' :
                        app.status === 'rejected' ? 'bg-destructive' : 'bg-secondary text-foreground'
                      }>
                        {app.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {app.status === 'pending' ? (
                        <Button size="sm" variant="outline" className="glass" onClick={() => { setSelectedApp(app); setIsDialogOpen(true); }}>
                          <Eye className="w-4 h-4 mr-1" /> Review
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Processed</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg glass-card">
          <DialogHeader>
            <DialogTitle>Review Loan Application</DialogTitle>
            <DialogDescription>
              Detailed risk analysis provided by AgriBridge Ledger.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-1">Requested Amount</div>
                  <div className="text-2xl font-bold text-primary">₹{selectedApp.amount.toLocaleString()}</div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-xl border border-border/50">
                  <div className="text-sm text-muted-foreground mb-1">AgriCredit Score</div>
                  <div className="text-2xl font-bold">{selectedApp.score} / 900</div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Applicant</span>
                  <span className="font-medium">{selectedApp.farmer} (Verified)</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Purpose</span>
                  <span className="font-medium">{selectedApp.purpose}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Platform Transaction Volume</span>
                  <span className="font-medium">₹24,50,000 YTD</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Past Default Rate</span>
                  <span className="font-medium text-green-500">0%</span>
                </div>
              </div>

              <DialogFooter className="flex gap-2 sm:justify-between w-full">
                <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" onClick={() => handleAction('rejected')} disabled={isProcessing}>
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button className="w-full bg-primary-gradient" onClick={() => handleAction('approved')} disabled={isProcessing}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve Loan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
