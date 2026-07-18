'use client';

import { useState, useEffect, use } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, Trophy, Gavel, ArrowLeft, BarChart2, Users, Flame, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CropImage } from '@/components/ui/crop-image';
import Link from 'next/link';

interface Bid {
  id: string;
  amount: number;
  bidder: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export default function LiveAuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const auctionId = unwrappedParams.id;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [auction, setAuction] = useState<any>(null);
  const [highestBid, setHighestBid] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [bidFeed, setBidFeed] = useState<Bid[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState<'live' | 'ended' | 'scheduled'>('live');
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);

  // Stats calculation
  const totalBids = bidFeed.length;
  const uniqueBidders = new Set(bidFeed.map(b => b.bidder)).size;

  const fetchAuctionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      }

      const res = await fetch(`/api/auctions/${auctionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setAuction(data.data);
        setHighestBid(data.data.currentHighestBid || data.data.startingBid);
        setStatus(data.data.status);
        
        // Calculate time left
        const end = new Date(data.data.endTime).getTime();
        const now = Date.now();
        setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));

        // Initial bids (populate from history)
        if (data.data.bids) {
          const history = data.data.bids.map((b: any) => {
            const bidderId = b.bidderId?._id || b.bidderId;
            const bidderName = b.bidderId?.name || 'Buyer';
            return {
              id: b._id || Math.random().toString(),
              amount: b.amount,
              bidder: bidderId === currentUserId ? 'You' : bidderName,
              timestamp: b.timestamp || new Date().toISOString(),
              isCurrentUser: bidderId === currentUserId
            };
          }).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setBidFeed(history);
        }
      }
    } catch (err) {
      console.error('Failed to fetch auction details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionDetails();

    // Determine correct WebSocket connection URL with port 5000 fallback for localhost
    const socketUrl = typeof window !== 'undefined' 
      ? (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '') 
      : '';
      
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('auction:join', auctionId);
    });

    newSocket.on('auction:update', (data) => {
      if (data.auctionId === auctionId) {
        setHighestBid(data.highestBid);
        if (data.history) {
          const formattedHistory = data.history.map((b: any) => ({
            id: Math.random().toString(36).substring(7),
            amount: b.amount,
            bidder: b.bidderId === currentUserId ? 'You' : b.bidderName,
            timestamp: data.timestamp || new Date().toISOString(),
            isCurrentUser: b.bidderId === currentUserId
          }));
          setBidFeed(formattedHistory);
        }
      }
    });

    newSocket.on('auction:error', (err) => {
      alert(`Bid Error: ${err.message}`);
    });
    
    newSocket.on('auction:completed', (data) => {
      if (data.auctionId === auctionId) {
        setStatus('ended');
        setHighestBid(data.amount);
        setTimeLeft(0);
        fetchAuctionDetails(); // Refetch ended details to update winner name
      }
    });

    return () => {
      newSocket.close();
    };
  }, [auctionId, currentUserId]);

  // Timer Tick hook
  useEffect(() => {
    if (status === 'live' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, timeLeft]);

  const minIncrement = auction?.minIncrement || 100;
  const nextRequiredBid = highestBid > 0 ? (highestBid + minIncrement) : (auction?.startingBid || 0);

  const placeBid = async () => {
    const val = parseInt(bidAmount);
    if (!val || val < nextRequiredBid) {
      alert(`Bid must be at least ₹${nextRequiredBid}`);
      return;
    }
    
    if (currentUserId) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/auctions/${auctionId}/bid`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: val })
        });
        const data = await res.json();
        if (!data.success) {
          alert(`Bid Error: ${data.message}`);
        }
      } catch (err: any) {
        alert(`Bid Error: ${err.message}`);
      }
    }
    setBidAmount('');
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground font-semibold">Connecting to bidding room...</span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center text-destructive">
        Auction room not found or unavailable.
      </div>
    );
  }

  const isLive = status === 'live' && timeLeft > 0;
  const isWinnerCurrentUser = auction.winnerId && (auction.winnerId._id === currentUserId || auction.winnerId === currentUserId);
  const winnerName = auction.winnerId?.name || 'Another Buyer';

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6 p-4 md:p-6">
      
      <div className="flex items-center justify-between shrink-0">
        <Link href="/buyer/auctions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Auctions
        </Link>
        {isLive ? (
          <Badge className="bg-rose-500 hover:bg-rose-600 text-white animate-pulse px-3 py-1 font-bold">
            LIVE BIDDING ROOM
          </Badge>
        ) : (
          <Badge className="bg-muted text-muted-foreground border border-border px-3 py-1 font-bold">
            CONCLUDED
          </Badge>
        )}
      </div>

      {/* Winner Banner */}
      {!isLive && status !== 'scheduled' && (
        <div className={`p-5 border rounded-2xl flex items-center gap-4 ${
          isWinnerCurrentUser 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
            : 'bg-secondary/30 border-border/50 text-foreground'
        }`}>
          <Trophy className={`w-8 h-8 shrink-0 ${isWinnerCurrentUser ? 'text-emerald-500 animate-bounce' : 'text-muted-foreground'}`} />
          <div>
            <h3 className="font-heading font-extrabold text-base">
              {isWinnerCurrentUser ? 'Congratulations! You won the auction!' : 'Auction Concluded'}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {isWinnerCurrentUser 
                ? `You secured this crop listing at the winning bid of ₹${highestBid}.`
                : `This auction sold to ${winnerName} at the winning bid of ₹${highestBid}.`}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Crop details, timer & bid input */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          
          <Card className="glass-card border-border/50 overflow-hidden rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden bg-muted border border-border/40 shrink-0">
                  <CropImage images={auction.cropId?.images} alt={auction.cropId?.name} />
                </div>
                
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-primary">
                      {auction.cropId?.category}
                    </span>
                    <h1 className="text-2xl font-heading font-bold text-foreground mt-1">
                      {auction.cropId?.name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available Stock: <span className="font-bold text-foreground">{auction.cropId?.quantity} {auction.cropId?.unit}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Farmer Owner: <span className="font-semibold text-foreground">{auction.farmerId?.name}</span>
                    </p>
                  </div>
                  
                  {/* Timer & Bid Summary */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="text-[10px] text-muted-foreground font-semibold mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" /> Remaining Time
                      </div>
                      <div className={`text-xl font-extrabold font-mono ${timeLeft < 60 && isLive ? 'text-rose-500 animate-pulse' : 'text-foreground'}`}>
                        {timeLeft > 0 ? formatTime(timeLeft) : '00:00:00'}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="text-[10px] text-primary font-bold mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Highest Bid
                      </div>
                      <div className="text-xl font-extrabold font-mono text-primary">
                        ₹{highestBid}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Place Bid Card */}
          <Card className="glass-card border-border/50 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Gavel className="w-4 h-4 text-primary" /> Place Your Bid
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLive ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                      <Input 
                        type="number" 
                        min={nextRequiredBid}
                        placeholder={`Minimum bid: ₹${nextRequiredBid}`}
                        className="pl-8 h-12 text-base bg-secondary/30 rounded-xl"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && placeBid()}
                      />
                    </div>
                    <Button 
                      className="h-12 px-6 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl text-sm"
                      onClick={placeBid}
                    >
                      Bid Now
                    </Button>
                  </div>

                  {/* Dynamic Increment Helpers */}
                  <div className="flex gap-2">
                    {[minIncrement, minIncrement * 2, minIncrement * 5].map(inc => (
                      <Button 
                        key={inc} 
                        variant="outline" 
                        className="text-xs h-9 rounded-lg border-border/50" 
                        onClick={() => setBidAmount((highestBid + inc).toString())}
                      >
                        +₹{inc}
                      </Button>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground/60 italic">
                    Min increment of ₹{minIncrement} required. All bids are binding.
                  </p>
                </div>
              ) : (
                <div className="p-8 text-center bg-secondary/20 border border-border/40 rounded-xl">
                  <XCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <h4 className="font-bold text-sm text-foreground">Bidding Room Closed</h4>
                  <p className="text-xs text-muted-foreground mt-1">This auction has concluded and is no longer accepting bids.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auction Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card border-border/50 rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Total Bids Placed</span>
                  <span className="text-base font-extrabold text-foreground">{totalBids} Bids</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-500">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Active Bidders</span>
                  <span className="text-base font-extrabold text-foreground">{uniqueBidders} Bidders</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Right Side: Live Bid History Feed */}
        <div className="w-full lg:w-1/3 flex flex-col min-h-[400px]">
          <Card className="glass-card border-border/50 flex-1 flex flex-col overflow-hidden rounded-2xl">
            <CardHeader className="border-b border-border/50 bg-secondary/10 pb-4">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                Bidding Log Feed
                {isLive && (
                  <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" /> Live
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto max-h-[500px]">
              <div className="flex flex-col p-4 gap-3">
                <AnimatePresence initial={false}>
                  {bidFeed.map((bid, i) => (
                    <motion.div
                      key={bid.id}
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      className={`p-3 rounded-xl flex items-center justify-between border transition-all ${
                        bid.isCurrentUser 
                          ? 'bg-primary/10 border-primary/20' 
                          : i === 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-transparent border-transparent'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-semibold text-xs flex items-center gap-1 ${bid.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                          {bid.bidder}
                          {i === 0 && <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(bid.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={`font-mono font-extrabold ${i === 0 ? 'text-base text-primary' : 'text-sm text-foreground'}`}>
                        ₹{bid.amount}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {bidFeed.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-xs italic">
                    Waiting for the opening bid...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
