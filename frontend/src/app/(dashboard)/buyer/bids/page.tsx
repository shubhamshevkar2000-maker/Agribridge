'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gavel, Clock, Trophy, AlertTriangle, XCircle, ArrowRight, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Bid {
  bidderId: any;
  amount: number;
  timestamp: string;
}

interface Auction {
  _id: string;
  cropId: {
    _id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    images?: string[];
  };
  farmerId: {
    _id: string;
    name: string;
  };
  startingBid: number;
  currentHighestBid: number;
  endTime: string;
  status: string;
  winnerId?: any;
  bids: Bid[];
}

export default function BuyerBidsPage() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});

  const fetchMyBids = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/auctions/bids/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setAuctions(data.data);
      }
    } catch (err) {
      console.error('Error fetching buyer bids:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBids();
  }, []);

  // Update countdown timers
  useEffect(() => {
    if (auctions.length === 0) return;

    const interval = setInterval(() => {
      const timers: Record<string, string> = {};
      auctions.forEach((auction) => {
        const diff = new Date(auction.endTime).getTime() - Date.now();
        if (diff <= 0 || auction.status !== 'live') {
          timers[auction._id] = 'Ended';
        } else {
          const hours = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          timers[auction._id] = `${hours}h ${mins}m ${secs}s`;
        }
      });
      setTimeRemaining(timers);
    }, 1000);

    return () => clearInterval(interval);
  }, [auctions]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground font-semibold">Loading your bids...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
          <Gavel className="w-8 h-8 text-primary" /> My Bids
        </h1>
        <p className="text-muted-foreground mt-1">Auctions you have placed bids on, live standings, and closed results.</p>
      </div>

      {auctions.length === 0 ? (
        <EmptyState 
          icon={Gavel} 
          title="No Active Bids" 
          description="You haven't participated in any crop bidding yet. Explore active auctions to start bidding."
          ctaText="Explore Live Auctions"
          ctaHref="/buyer/auctions"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => {
            const myId = user?._id;
            
            // Find user's highest bid amount
            const myHighestBid = auction.bids
              .filter((b: any) => {
                const bidderId = b.bidderId?._id || b.bidderId;
                return bidderId === myId;
              })
              .reduce((max, b) => Math.max(max, b.amount), 0);

            const isLive = auction.status === 'live';
            const isHighest = myHighestBid === auction.currentHighestBid;
            const timerText = timeRemaining[auction._id] || 'Loading...';
            
            const winnerId = auction.winnerId?._id || auction.winnerId;
            const didIWin = winnerId && winnerId === myId;

            return (
              <Link key={auction._id} href={`/buyer/auctions/${auction._id}`}>
                <Card className="glass-card overflow-hidden border-border/50 hover:shadow-lg hover:border-primary/30 transition-all rounded-2xl flex flex-col h-full cursor-pointer group">
                  {/* Status Banner */}
                  <div className="relative h-28 bg-secondary/20 flex items-center justify-center border-b border-border/50">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-md">
                      {auction.cropId?.category}
                    </span>
                    <Badge className={`absolute top-4 right-4 shadow-sm font-bold ${isLive ? 'bg-amber-500 text-white animate-pulse' : 'bg-neutral-500 text-white'}`}>
                      {auction.status.toUpperCase()}
                    </Badge>
                  </div>

                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-heading font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        {auction.cropId?.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
                        <span>Farmer: <span className="font-semibold text-foreground">{auction.farmerId?.name}</span></span>
                        <span className="font-bold text-foreground">Qty: {auction.cropId?.quantity} {auction.cropId?.unit}</span>
                      </div>
                    </div>

                    {/* Pricing details */}
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/30">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Your Highest Bid</span>
                        <span className="text-base font-extrabold text-foreground">₹{myHighestBid}</span> 
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Current Highest</span>
                        <span className="text-base font-extrabold text-primary">₹{auction.currentHighestBid}</span>
                      </div>
                    </div>

                    {/* Timer & Status Indicators */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {timerText}
                      </span>

                      <div>
                        {isLive ? (
                          isHighest ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold gap-1 shadow-none">
                              <Trophy className="w-3 h-3" /> Winning
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold gap-1 shadow-none">
                              <AlertTriangle className="w-3 h-3" /> Outbid
                            </Badge>
                          )
                        ) : didIWin ? (
                          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold gap-1 shadow-none">
                            <Trophy className="w-3 h-3" /> Auction Won
                          </Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border border-border font-bold gap-1 shadow-none">
                            <XCircle className="w-3 h-3" /> Ended
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
