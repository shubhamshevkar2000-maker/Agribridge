'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Link from 'next/link';

import { api } from '@/lib/api';

export default function CreditPage() {
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchCredit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get(`/api/credit/score`);
      if (data.success) {
        setLedger(data.data);
      } else {
        setError(new Error('Failed to load credit profile'));
      }
    } catch (err) {
      console.error('Failed to fetch credit score', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredit();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error || !ledger) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold text-destructive">Failed to load credit profile</h2>
        <p className="text-muted-foreground mt-2">Please check your connection and try again.</p>
        <Button onClick={fetchCredit} className="mt-4">Retry</Button>
      </div>
    );
  }

  const radarData = [
    { subject: 'Repayment', A: ledger.factors?.repaymentHistory || 0, fullMark: 100 },
    { subject: 'Consistency', A: ledger.factors?.transactionConsistency || 0, fullMark: 100 },
    { subject: 'Disputes (Inv)', A: 100 - (ledger.factors?.disputeRate || 0), fullMark: 100 },
    { subject: 'Income Stability', A: ledger.factors?.incomeStability || 0, fullMark: 100 },
  ];

  const historyData = (ledger.history || []).map((h: any) => ({
    date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: h.score
  }));

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-500';
    if (score >= 650) return 'text-primary';
    if (score >= 550) return 'text-orange-500';
    return 'text-destructive';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" /> AgriCredit Profile
          </h1>
          <p className="text-muted-foreground mt-2">Your unified trust and credit score for unlocking micro-loans</p>
        </div>
        <Link href="/farmer/loans">
          <Button className="bg-primary-gradient hover:scale-105 transition-transform shadow-lg shadow-primary/20">
            Apply for Loan <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Scores */}
        <Card className="glass-card border-border/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardContent className="p-8 flex flex-col items-center justify-center h-full relative z-10">
            <h3 className="text-lg font-medium text-muted-foreground mb-6 uppercase tracking-widest">Global Trust Score</h3>
            <div className="relative flex items-center justify-center mb-8">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle cx="96" cy="96" r="88" className="stroke-muted fill-none" strokeWidth="12" />
                <motion.circle 
                  cx="96" cy="96" r="88" 
                  className="stroke-primary fill-none" 
                  strokeWidth="12" 
                  strokeDasharray="552" 
                  initial={{ strokeDashoffset: 552 }}
                  animate={{ strokeDashoffset: 552 - (552 * ledger.trustScore) / 1000 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold font-mono ${getScoreColor(ledger.trustScore || 0)}`}>{ledger.trustScore || 0}</span>
                <span className="text-sm text-muted-foreground mt-1">/ 1000</span>
              </div>
            </div>
            
            <div className="w-full bg-secondary/50 p-4 rounded-xl border border-border/50 text-center">
              <div className="text-sm text-muted-foreground mb-1">Financial Credit Score</div>
              <div className={`text-2xl font-bold ${getScoreColor(ledger.creditScore || 0)}`}>{ledger.creditScore || 0}</div>
              <Progress value={(ledger.creditScore || 0) / 10} className="h-1.5 mt-2 bg-muted/50" />
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Trust Factors Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="hsl(var(--muted))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* History Chart */}
        <Card className="glass-card border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Score History
              <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> +20 points this month
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Suggested Schemes */}
        <Card className="glass-card border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Pre-approved Loan Schemes</CardTitle>
            <p className="text-sm text-muted-foreground">Based on your AgriCredit Score of {ledger.creditScore}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const score = ledger.creditScore;
                let schemes = [];
                if (score >= 750) {
                  schemes = [
                    { name: "Premium Agri Expansion", amount: "₹5,00,000", interest: "6.5% p.a.", tenure: "24 months", tag: "Best Offer" },
                    { name: "Green Tech Machinery", amount: "₹2,50,000", interest: "7.0% p.a.", tenure: "18 months", tag: "Flexible" },
                    { name: "Zero-Processing Micro", amount: "₹1,00,000", interest: "7.5% p.a.", tenure: "12 months", tag: "Instant" }
                  ];
                } else if (score >= 600) {
                  schemes = [
                    { name: "Standard Crop Loan", amount: "₹1,00,000", interest: "8.5% p.a.", tenure: "12 months", tag: "Popular" },
                    { name: "Fertilizer Micro-credit", amount: "₹50,000", interest: "9.0% p.a.", tenure: "6 months", tag: "Quick Cash" }
                  ];
                } else {
                  schemes = [
                    { name: "Seed Starter Pack", amount: "₹20,000", interest: "11.0% p.a.", tenure: "3 months", tag: "Build Credit" }
                  ];
                }
                
                return schemes.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/50 bg-secondary/30 flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                      {s.tag}
                    </div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-2xl font-bold text-primary mt-2">{s.amount}</div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-4 border-t border-border/50 pt-2">
                      <span>Interest: <span className="font-medium text-foreground">{s.interest}</span></span>
                      <span>Tenure: <span className="font-medium text-foreground">{s.tenure}</span></span>
                    </div>
                    <Link href="/farmer/loans" className="mt-2">
                      <Button variant="outline" size="sm" className="w-full">Apply Now</Button>
                    </Link>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
