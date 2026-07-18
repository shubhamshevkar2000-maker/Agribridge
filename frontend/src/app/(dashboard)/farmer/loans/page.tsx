'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, FileText, CheckCircle, Clock, XCircle, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Loan {
  _id: string;
  bankId: { name: string } | string;
  amountRequested: number;
  amountApproved?: number;
  tenure: number;
  interestRate?: number;
  status: 'pending' | 'under_review' | 'approved' | 'disbursed' | 'rejected';
  createdAt: string;
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applyAmount, setApplyAmount] = useState('');
  const [applyTenure, setApplyTenure] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [estimatedEmi, setEstimatedEmi] = useState<number>(0);

  useEffect(() => {
    const p = parseFloat(applyAmount);
    const n = parseInt(applyTenure);
    if (!isNaN(p) && !isNaN(n) && p > 0 && n > 0) {
      const r = 8.5 / 12 / 100; // 8.5% p.a.
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setEstimatedEmi(Math.round(emi));
    } else {
      setEstimatedEmi(0);
    }
  }, [applyAmount, applyTenure]);

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/loans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLoans(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch loans', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/loans/apply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          amountRequested: parseInt(applyAmount),
          tenure: parseInt(applyTenure)
        })
      });
      const data = await res.json();
      if (data.success) {
        setApplyAmount('');
        setApplyTenure('');
        setIsDialogOpen(false);
        fetchLoans();
      } else {
        alert(data.message || 'Failed to apply for loan');
      }
    } catch (err) {
      console.error('Failed to apply', err);
    }
    setIsApplying(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Pending Review' };
      case 'under_review': return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Under Review' };
      case 'approved': return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Approved' };
      case 'disbursed': return { icon: Landmark, color: 'text-primary', bg: 'bg-primary/10', label: 'Disbursed' };
      case 'rejected': return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Rejected' };
      default: return { icon: AlertCircle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Landmark className="w-8 h-8 text-primary" /> Micro-Loans
          </h1>
          <p className="text-muted-foreground mt-2">Manage your agricultural loan applications</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-primary-gradient shadow-lg shadow-primary/20" />}>
              <Plus className="w-4 h-4 mr-2" /> Apply for Loan
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass-card border-border/50">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Apply for Micro-Loan</DialogTitle>
              <DialogDescription>
                Your application will be automatically routed to partner banks based on your AgriCredit score.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleApply} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Loan Amount (₹)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="e.g. 50000" 
                  value={applyAmount}
                  onChange={e => setApplyAmount(e.target.value)}
                  required 
                  min="1000"
                  className="bg-input/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenure">Tenure (Months)</Label>
                <Input 
                  id="tenure" 
                  type="number" 
                  placeholder="e.g. 12" 
                  value={applyTenure}
                  onChange={e => setApplyTenure(e.target.value)}
                  required 
                  min="1"
                  max="60"
                  className="bg-input/50"
                />
              </div>
              {estimatedEmi > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg flex justify-between items-center mt-2 border border-primary/20">
                  <span className="text-sm font-medium text-primary">Estimated EMI (at 8.5% p.a.)</span>
                  <span className="text-lg font-bold text-primary">₹{estimatedEmi.toLocaleString()}/mo</span>
                </div>
              )}
              <Button type="submit" className="w-full bg-primary-gradient mt-4" disabled={isApplying}>
                {isApplying ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : loans.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl border-border/50">
          <Landmark className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold mb-2">No Loan Applications</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You haven't applied for any micro-loans yet. Build your AgriCredit score and apply here when you need financing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {loans.map((loan, i) => {
              const conf = getStatusConfig(loan.status);
              const Icon = conf.icon;
              return (
                <motion.div
                  key={loan._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass-card border-border/50 h-full flex flex-col hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`p-3 rounded-2xl ${conf.bg}`}>
                          <Icon className={`w-6 h-6 ${conf.color}`} />
                        </div>
                        <Badge variant="outline" className={`${conf.bg} ${conf.color} border-transparent`}>
                          {conf.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-mono">₹{loan.amountRequested.toLocaleString()}</CardTitle>
                      <p className="text-sm text-muted-foreground">Requested Amount</p>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                      <div className="space-y-3 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tenure</span>
                          <span className="font-medium text-foreground">{loan.tenure} Months</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Bank Partner</span>
                          <span className="font-medium text-foreground">
                            {typeof loan.bankId === 'object' ? loan.bankId?.name : 'Auto-Routing'}
                          </span>
                        </div>
                        {loan.interestRate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Interest Rate</span>
                            <span className="font-medium text-emerald-500">{loan.interestRate}% p.a.</span>
                          </div>
                        )}
                        {loan.amountApproved && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Approved Amt.</span>
                            <span className="font-medium text-primary">₹{loan.amountApproved.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
                      Applied on {new Date(loan.createdAt).toLocaleDateString()}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
