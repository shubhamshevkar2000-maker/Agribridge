'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gavel, Clock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Auction {
  _id: string;
  cropId: {
    _id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
  };
  farmerId: {
    name: string;
    trustScore: number;
  };
  currentHighestBid: number;
  startingBid: number;
  endTime: string;
  status: string;
}

export default function BuyerAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auctions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAuctions(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch auctions');
      }
    } catch (err: any) {
      console.error('Failed to fetch auctions:', err);
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Gavel className="w-8 h-8 text-primary" /> Live Auctions
          </h1>
          <p className="text-muted-foreground mt-1">Bid on premium crops in real-time</p>
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h3 className="text-xl font-heading font-bold">Failed to Load Auctions</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <Button onClick={fetchAuctions} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : auctions.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-border/50 bg-secondary/10">
          <Gavel className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold mb-2">No active auctions.</h3>
          <p className="text-muted-foreground">Check back later for new live listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction, i) => (
            <motion.div
              key={auction._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/buyer/auctions/${auction._id}`}>
                <Card className="glass-card hover:shadow-lg transition-all border border-border/50 group h-full flex flex-col justify-between overflow-hidden rounded-2xl">
                  <div className="relative h-40 bg-secondary/30 flex items-center justify-center overflow-hidden">
                    <span className="text-muted-foreground/30 font-bold text-3xl uppercase">
                      {auction.cropId?.category || 'Crop'}
                    </span>
                    <Badge className="absolute top-4 right-4 bg-red-500 text-white animate-pulse">
                      LIVE
                    </Badge>
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold font-heading group-hover:text-primary transition-colors">{auction.cropId?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {auction.cropId?.quantity} {auction.cropId?.unit} • Farmer: {auction.farmerId?.name}
                      </p>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-border/30">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Current Bid</p>
                        <p className="text-xl font-bold text-primary">₹{auction.currentHighestBid || auction.startingBid}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-xs text-orange-500 font-semibold mb-2 gap-1 bg-orange-500/10 px-2 py-1 rounded">
                          <Clock className="w-3.5 h-3.5" /> Ends soon
                        </div>
                        <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all rounded-lg">
                          Join <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
