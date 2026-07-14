'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, ShieldCheck, Leaf, Heart, ShoppingBag, Info, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Crop {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  isOrganic: boolean;
  qualityGrade?: string;
  farmerId?: {
    _id: string;
    name: string;
    location?: { coordinates?: number[] };
    trustScore?: number;
  };
  harvestDate?: string;
  createdAt: string;
}

export default function CropDetailPage({ params }: { params: { id: string } }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/crops/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setCrop(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch crop:', error);
      }
      setLoading(false);
    };
    fetchCrop();
  }, [params.id]);

  const handleBuyNow = async () => {
    // Stubbed Buy Now action
    await new Promise(r => setTimeout(r, 1000));
    setPurchaseSuccess(true);
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-muted-foreground font-semibold">
        <h2 className="text-2xl mb-4 text-foreground">Crop Listing not found</h2>
        <Link href="/buyer/marketplace">
          <Button variant="outline">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Link href="/buyer/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Link>

      {purchaseSuccess ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 rounded-3xl text-center border border-primary/20 bg-primary/5"
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary/30">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-heading font-bold mb-4">Order Placed Successfully!</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Your purchase for {crop.quantity} {crop.unit} of {crop.name} has been logged.
            (Note: Payment gateway integration will be completed in Phase 6).
          </p>
          <Link href="/buyer">
            <Button className="bg-primary-gradient">Return to Dashboard</Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column - Image Placeholder */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] glass-card border border-border/50 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground/30 font-bold text-6xl uppercase">{crop.category}</span>
              <div className="absolute top-4 left-4 flex gap-2">
                {crop.isOrganic && <Badge className="bg-primary shadow-lg backdrop-blur-md px-3 py-1 text-sm"><Leaf className="w-3 h-3 mr-1" /> Organic</Badge>}
              </div>
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 p-3 bg-background/80 hover:bg-background backdrop-blur-md rounded-full transition-colors shadow-lg"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground hover:text-destructive'}`} />
              </button>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-heading font-bold mb-2">{crop.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Maharashtra, India</div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div>Listed recently</div>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <div className="text-5xl font-heading font-bold text-primary">₹{crop.pricePerUnit}</div>
              <div className="text-lg text-muted-foreground mb-1">/ {crop.unit}</div>
            </div>

            <div className="glass p-5 rounded-2xl border border-border/50 mb-8 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Info className="w-4 h-4" /> Crop Details</h3>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Category</div>
                  <div className="font-medium">{crop.category}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Quality Grade</div>
                  <div className="font-medium">{crop.qualityGrade || 'Standard'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Available Quantity</div>
                  <div className="font-medium">{crop.quantity} {crop.unit}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Harvest Date</div>
                  <div className="font-medium">{crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-border/50 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold">
                  {crop.farmerId?.name?.charAt(0) || 'F'}
                </div>
                <div>
                  <div className="font-semibold text-lg">{crop.farmerId?.name || 'Unknown Farmer'}</div>
                  <div className="text-sm text-primary flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-4 h-4" /> AgriBridge Verified ({crop.farmerId?.trustScore || 850} Trust Score)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Truck className="w-4 h-4" /> Eligible for shared logistics routing
              </div>
              <Button size="lg" className="w-full h-14 text-lg bg-primary-gradient hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20" onClick={handleBuyNow}>
                Buy Now (Phase 6 Stub)
              </Button>
            </div>

          </motion.div>
        </div>
      )}
    </div>
  );
}
