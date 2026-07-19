'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Clock, Plus, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
<<<<<<< HEAD
import { CropImage } from '@/components/ui/crop-image';
=======
import { getCropImageUrl, getValidImageUrl } from '@/utils/cropImages';
>>>>>>> nidhi/logistics-enhancement

interface Crop {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  images: string[];
  status: string;
}

interface Auction {
  _id: string;
  cropId: Crop;
  startingBid: number;
  currentHighestBid: number;
  startTime: string;
  endTime: string;
  quantity: number;
  minIncrement: number;
  reservePrice?: number;
  notes?: string;
  status: string;
}

export default function FarmerAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [selectedCropId, setSelectedCropId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [startingBid, setStartingBid] = useState('');
  const [minIncrement, setMinIncrement] = useState('100');
  const [reservePrice, setReservePrice] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [notes, setNotes] = useState('');

  // Selected crop reference for unit and quantity validation
  const selectedCrop = crops.find(c => c._id === selectedCropId);

  const fetchAuctions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auctions/farmer/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAuctions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch auctions:', err);
    }
  };

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/crops/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Only allow drafting/listing crops with quantity > 0
        const eligibleCrops = data.data.filter(
          (c: Crop) => ['draft', 'listed'].includes(c.status) && c.quantity > 0
        );
        setCrops(eligibleCrops);
      }
    } catch (err) {
      console.error('Failed to fetch crops for dropdown:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchAuctions(), fetchCrops()]);
      setLoading(false);
    };
    init();
  }, []);

  // Autofill current times on form open
  useEffect(() => {
    if (isFormOpen) {
      const now = new Date();
      const formatDateTime = (date: Date) => {
        const tzoffset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
        return localISOTime;
      };
      setStartTimeStr(formatDateTime(now));
      
      // Default to 1 hour later
      const later = new Date(now.getTime() + 60 * 60000);
      setEndTimeStr(formatDateTime(later));
    }
  }, [isFormOpen]);

  const handleStartAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCropId || !startingBid || !quantity || !startTimeStr || !endTimeStr) {
      setError('Please fill in all mandatory fields');
      return;
    }

    if (selectedCrop && Number(quantity) > selectedCrop.quantity) {
      setError(`Cannot auction more than available stock (${selectedCrop.quantity} ${selectedCrop.unit})`);
      return;
    }

    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);
    if (start >= end) {
      setError('Auction End Time must be strictly after Start Time');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropId: selectedCropId,
          startingBid: Number(startingBid),
          minIncrement: Number(minIncrement),
          reservePrice: reservePrice ? Number(reservePrice) : undefined,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          quantity: Number(quantity),
          notes: notes || undefined
        })
      });
      
      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${res.statusText || 'Error'} (Status: ${res.status})`);
      }

      if (data.success) {
        setIsFormOpen(false);
        setSelectedCropId('');
        setQuantity('');
        setStartingBid('');
        setMinIncrement('100');
        setReservePrice('');
        setNotes('');
        await Promise.all([fetchAuctions(), fetchCrops()]);
      } else {
        setError(data.message || 'Failed to start auction');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'scheduled':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'sold':
      case 'closed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'cancelled':
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3 text-foreground">
            <Gavel className="w-8 h-8 text-primary" /> My Auctions
          </h1>
          <p className="text-muted-foreground mt-1">Host live bidding on your harvested crops</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-xl">
          {isFormOpen ? 'Cancel' : <><Plus className="w-5 h-5" /> Start New Auction</>}
        </Button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="glass-card border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle>Create & Schedule Auction</CardTitle>
                <CardDescription>Select an existing crop from your inventory to put up for bidding.</CardDescription>
              </CardHeader>
              <CardContent>
                {crops.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/60 rounded-2xl bg-secondary/10">
                    <AlertCircle className="w-10 h-10 text-primary mb-3" />
                    <h3 className="text-lg font-heading font-semibold text-foreground">No eligible crops available for auction</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      You must have listed or draft crops with quantity greater than zero to schedule an auction.
                    </p>
                    <Link href="/farmer/crops" className="mt-4">
                      <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center gap-1.5">
                        Add a Crop First <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleStartAuction} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select Crop *</label>
                        <select 
                          required
                          className="w-full h-10 px-3 py-2 rounded-xl border border-input bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                          value={selectedCropId}
                          onChange={(e) => {
                            setSelectedCropId(e.target.value);
                            setQuantity('');
                          }}
                        >
                          <option value="">-- Select Crop --</option>
                          {crops.map((crop) => (
                            <option key={crop._id} value={crop._id}>
                              {crop.name} ({crop.quantity} {crop.unit} available)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quantity to Auction *</label>
                        <div className="flex gap-2">
                          <Input 
                            required 
                            type="number" 
                            min="0.01" 
                            step="any"
                            placeholder={selectedCrop ? `Max ${selectedCrop.quantity}` : "e.g., 50"}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                          />
                          <span className="h-10 px-3 flex items-center border border-input bg-secondary/30 rounded-xl text-sm shrink-0 font-medium">
                            {selectedCrop?.unit || 'unit'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Starting Bid (₹ per unit) *</label>
                        <Input 
                          required 
                          type="number" 
                          min="1"
                          placeholder="e.g., 1500" 
                          value={startingBid}
                          onChange={(e) => setStartingBid(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Increment (₹) *</label>
                        <Input 
                          required 
                          type="number" 
                          min="10"
                          placeholder="e.g., 100" 
                          value={minIncrement}
                          onChange={(e) => setMinIncrement(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Reserve Price (₹, Optional)</label>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="e.g., 2000" 
                          value={reservePrice}
                          onChange={(e) => setReservePrice(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date & Time *</label>
                        <Input 
                          required
                          type="datetime-local" 
                          value={startTimeStr}
                          onChange={(e) => setStartTimeStr(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date & Time *</label>
                        <Input 
                          required
                          type="datetime-local" 
                          value={endTimeStr}
                          onChange={(e) => setEndTimeStr(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Special Notes / Description (Optional)</label>
                      <textarea 
                        placeholder="Add special instructions, payment terms, or delivery expectations..." 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    
                    {error && (
                      <p className="text-sm text-destructive flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4" /> {error}
                      </p>
                    )}
                    
                    <div className="flex justify-end pt-4 border-t border-border/30 gap-3">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setIsFormOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/95 text-white px-6 rounded-xl">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Launching...
                          </>
                        ) : 'Launch Auction'}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="glass-card border-border/50">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/60 mb-4">
                <Gavel className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">No auctions started yet.</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">You are not running any live or scheduled crop auctions currently.</p>
              <Button onClick={() => setIsFormOpen(true)} className="bg-primary text-white rounded-xl mt-6">
                Start New Auction
              </Button>
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
                  <Card className="glass-card border-border/50 group h-full overflow-hidden flex flex-col justify-between">
                    <div>
                      {/* Premium crop image header */}
                      <div className="relative h-44 overflow-hidden bg-muted flex items-center justify-center shrink-0">
<<<<<<< HEAD
                        <CropImage 
                          images={auction.cropId?.images} 
=======
                        <img 
                          src={getValidImageUrl(auction.cropId?.images?.[0], auction.cropId?.name)} 
>>>>>>> nidhi/logistics-enhancement
                          alt={auction.cropId?.name || 'Crop'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 right-3">
                          <Badge className={`font-semibold border shadow-md ${getStatusColor(auction.status)}`}>
                            {auction.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold font-heading text-foreground">{auction.cropId?.name || 'Deleted Crop'}</h3>
                          <p className="text-sm text-muted-foreground font-medium">
                            {auction.quantity || auction.cropId?.quantity} {auction.cropId?.unit || 'units'}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-border/30">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Starting Bid</p>
                            <p className="text-base font-bold text-foreground">₹{auction.startingBid}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Highest Bid</p>
                            <p className="text-lg font-bold text-primary">₹{auction.currentHighestBid || auction.startingBid}</p>
                          </div>
                        </div>

                        {auction.notes && (
                          <div className="text-xs text-muted-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/30">
                            {auction.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 shrink-0">
                      {auction.status === 'live' && (
                        <div className="flex items-center text-xs text-orange-500 font-semibold gap-1.5 bg-orange-500/10 p-2.5 rounded-xl justify-center border border-orange-500/20">
                          <Clock className="w-4 h-4 animate-pulse" /> Ends at: {new Date(auction.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      {auction.status === 'scheduled' && (
                        <div className="flex items-center text-xs text-yellow-600 font-semibold gap-1.5 bg-yellow-500/10 p-2.5 rounded-xl justify-center border border-yellow-500/20">
                          <Clock className="w-4 h-4" /> Starts: {new Date(auction.startTime).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      )}
                      {(auction.status === 'sold' || auction.status === 'closed') && (
                        <div className="flex items-center text-xs text-green-600 font-semibold gap-1.5 bg-green-500/10 p-2.5 rounded-xl justify-center border border-green-500/20">
                          Completed with Bid ₹{auction.currentHighestBid}
                        </div>
                      )}
                      {auction.status === 'cancelled' && (
                        <div className="flex items-center text-xs text-muted-foreground font-semibold gap-1.5 bg-secondary/30 p-2.5 rounded-xl justify-center border border-border/45">
                          Cancelled / No Bids
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
