'use client';

import { useState, useEffect, useRef, use } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, CheckCircle, Gavel, ArrowLeft } from 'lucide-react';
import { CropImage } from '@/components/ui/crop-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  const [status, setStatus] = useState<'live' | 'ended'>('live');
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
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
          setStatus(data.data.status === 'live' ? 'live' : 'ended');
          
          // Calculate time left
          const end = new Date(data.data.endTime).getTime();
          const now = Date.now();
          setTimeLeft(Math.max(0, Math.floor((end - now) / 1000)));

          // Initial bids (populate from history)
          if (data.data.bids) {
            const history = data.data.bids.map((b: any) => ({
              id: b._id || Math.random().toString(),
              amount: b.amount,
              bidder: b.bidderId === currentUserId ? 'You' : 'Buyer',
              timestamp: b.timestamp,
              isCurrentUser: b.bidderId === currentUserId
            })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setBidFeed(history);
          }
        }
      } catch (err) {
        console.error('Failed to fetch auction', err);
      }
      setLoading(false);
    };

    fetchAuction();

    const socketUrl = typeof window !== 'undefined' 
      ? (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '') 
      : '';
      
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('auction:join', auctionId);
    });

    const handleUpdate = (data: any) => {
      if (data.auctionId === auctionId) {
        setHighestBid(data.highestBid);
        if (data.history) {
          const formattedHistory = data.history.map((b: any) => ({
            id: b.id || Math.random().toString(36).substring(7),
            amount: b.amount,
            bidder: b.bidderName || 'Buyer',
            timestamp: b.timestamp || new Date().toISOString(),
            isCurrentUser: false
          }));
          setBidFeed(formattedHistory);
        }
      }
    };

    const handleError = (err: any) => {
      alert(`Bid Error: ${err.message}`);
    };

    const handleCompleted = (data: any) => {
      if (data.auctionId === auctionId) {
        setStatus('ended');
        setHighestBid(data.amount);
        setTimeLeft(0);
      }
    };

    newSocket.on('auction:update', handleUpdate);
    newSocket.on('auction:error', handleError);
    newSocket.on('auction:completed', handleCompleted);

    return () => {
      newSocket.off('auction:update', handleUpdate);
      newSocket.off('auction:error', handleError);
      newSocket.off('auction:completed', handleCompleted);
      newSocket.disconnect();
    };
  }, [auctionId, currentUserId]);

  useEffect(() => {
    if (status === 'live' && auction?.endTime) {
      const timer = setInterval(() => {
        const end = new Date(auction.endTime).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((end - now) / 1000));
        
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, auction?.endTime]);

  const placeBid = () => {
    const val = parseInt(bidAmount);
    if (!val || val <= highestBid) return;
    
    if (socket && currentUserId) {
      socket.emit('auction:bid', {
        auctionId: auctionId,
        amount: val,
        userId: currentUserId
      });
    }
    setBidAmount('');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-8 text-center">Loading auction...</div>;
  if (!auction) return <div className="p-8 text-center text-destructive">Auction not found</div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      
      <div className="flex items-center justify-between shrink-0">
        <Link href="/farmer/auctions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Auctions
        </Link>
        {status === 'live' && timeLeft > 0 ? (
          <Badge variant="destructive" className="animate-pulse bg-destructive px-3 py-1">LIVE AUCTION</Badge>
        ) : (
          <Badge className="bg-primary px-3 py-1">AUCTION ENDED</Badge>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Side - Details & Action */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6 pb-4">
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <CropImage 
                  images={auction.cropId?.images} 
                  alt={auction.cropId?.name || "Crop"} 
                  className="w-full sm:w-48 h-48 rounded-xl object-cover shrink-0"
                />
                <div className="flex flex-col flex-1">
                  <h1 className="text-2xl font-heading font-bold">{auction.cropId?.name}</h1>
                  <p className="text-muted-foreground mb-4">{auction.cropId?.quantity} {auction.cropId?.unit} • Farmer: {auction.farmerId?.name}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Time Remaining
                      </div>
                      <div className={`text-2xl font-bold font-mono ${timeLeft < 60 && status === 'live' ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                        {timeLeft > 0 ? formatTime(timeLeft) : '00:00'}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="text-xs text-primary font-medium mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Current Highest Bid
                      </div>
                      <motion.div 
                        key={highestBid}
                        initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
                        animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
                        className="text-2xl font-bold font-mono text-foreground"
                      >
                        ₹{highestBid}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 flex-1">
            <CardHeader>
              <CardTitle>Auction Status</CardTitle>
            </CardHeader>
            <CardContent>
              {status === 'live' && timeLeft > 0 ? (
                <div className="p-6 bg-secondary/50 rounded-xl text-center border border-border/50">
                  <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-bold mb-2">Auction is Live</h3>
                  <p className="text-muted-foreground">Buyers are currently placing bids on your crop.</p>
                </div>
              ) : (
                <div className="p-6 bg-secondary/50 rounded-xl text-center border border-border/50">
                  <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-heading font-bold mb-2">Auction Concluded</h3>
                  <p className="text-muted-foreground">The winning bid was ₹{highestBid}.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Side - Bid Feed */}
        <div className="w-full lg:w-1/3 flex flex-col min-h-[400px]">
          <Card className="glass-card border-border/50 flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-secondary/20 pb-4">
              <CardTitle className="text-lg flex items-center justify-between">
                Live Bid Feed
                {status === 'live' && timeLeft > 0 && (
                  <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Live
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto">
              <div className="flex flex-col p-4 gap-3">
                <AnimatePresence initial={false}>
                  {bidFeed.map((bid, i) => (
                    <motion.div
                      key={bid.id}
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      className={`p-3 rounded-xl flex items-center justify-between border ${
                        bid.isCurrentUser 
                          ? 'bg-primary/10 border-primary/30' 
                          : i === 0 ? 'bg-secondary/50 border-border/50' : 'bg-transparent border-transparent'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-semibold text-sm ${bid.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                          {bid.bidder}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(bid.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className={`font-mono font-bold ${i === 0 ? 'text-lg' : 'text-base'}`}>
                        ₹{bid.amount}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {bidFeed.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    Waiting for first bid...
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
