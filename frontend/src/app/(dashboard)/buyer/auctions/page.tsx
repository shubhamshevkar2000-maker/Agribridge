'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gavel, Clock, ArrowRight } from 'lucide-react';
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

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/auctions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setAuctions(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch auctions:', err);
      }
      setLoading(false);
    };
    fetchAuctions();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Gavel className="w-8 h-8 text-primary" /> Live Auctions
          </h1>
          <p className="text-muted-foreground mt-2">Bid on premium crops in real-time</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : auctions.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border-border/50">
          <Gavel className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold mb-2">No Active Auctions</h3>
          <p className="text-muted-foreground">Check back later for new live listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction, i) => (
            <motion.div
              key={auction._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`./auctions/${auction._id}`}>
                <Card className="glass-card hover:shadow-lg transition-all border-border/50 group h-full">
                  <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                    <span className="text-muted-foreground/30 font-bold text-4xl uppercase">
                      {auction.cropId?.category}
                    </span>
                    <Badge className="absolute top-4 right-4 bg-red-500/90 hover:bg-red-500 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white mr-2 animate-ping" /> LIVE
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold font-heading mb-1">{auction.cropId?.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {auction.cropId?.quantity} {auction.cropId?.unit} • Farmer: {auction.farmerId?.name}
                    </p>
                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Bid</p>
                        <p className="text-2xl font-bold text-primary">₹{auction.currentHighestBid || auction.startingBid}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-orange-500 font-medium mb-1 gap-1">
                          <Clock className="w-4 h-4" /> Ends soon
                        </div>
                        <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Join <ArrowRight className="w-4 h-4 ml-1" />
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
