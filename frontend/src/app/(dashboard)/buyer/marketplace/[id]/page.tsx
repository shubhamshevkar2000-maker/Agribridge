'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, ShieldCheck, Star, Truck, Info, Leaf, Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CropDetailPage({ params }: { params: { id: string } }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // In a real app, fetch based on params.id
  const crop = {
    id: params.id,
    title: 'Premium Red Tomatoes',
    description: 'High-quality, farm-fresh red tomatoes grown without synthetic pesticides. Perfect for retail supermarkets and ketchup manufacturing. Harvested just 2 days ago.',
    farmer: 'Ramesh Kumar',
    location: 'Nashik, Maharashtra',
    price: 2350,
    qty: 50,
    img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=1000&q=80',
    trust: 850,
    organic: true,
    harvestDate: '2026-07-10',
    expiryEst: '2026-07-25'
  };

  const handleBuyNow = async () => {
    // Stubbed Buy Now action (Phase 6 will handle real payments)
    await new Promise(r => setTimeout(r, 1000));
    setPurchaseSuccess(true);
  };

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
            Your purchase for {crop.qty} Quintals of {crop.title} has been logged.
            (Note: Payment gateway integration will be completed in Phase 6).
          </p>
          <Button asChild className="bg-primary-gradient"><Link href="/buyer">Return to Dashboard</Link></Button>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Column - Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] glass-card border border-border/50">
              <img src={crop.img} alt={crop.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                {crop.organic && <Badge className="bg-primary shadow-lg backdrop-blur-md px-3 py-1 text-sm"><Leaf className="w-3 h-3 mr-1" /> Organic</Badge>}
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
            <h1 className="text-3xl lg:text-4xl font-heading font-bold mb-2">{crop.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {crop.location}</div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <div>Listed 2 hours ago</div>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <div className="text-5xl font-heading font-bold text-primary">₹{crop.price}</div>
              <div className="text-lg text-muted-foreground mb-1">/ quintal</div>
            </div>

            <div className="glass p-5 rounded-2xl border border-border/50 mb-8 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Info className="w-4 h-4" /> Crop Details</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{crop.description}</p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Available Quantity</div>
                  <div className="font-medium">{crop.qty} Quintals</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Harvest Date</div>
                  <div className="font-medium">{crop.harvestDate}</div>
                </div>
              </div>
            </div>

            <div className="glass p-5 rounded-2xl border border-border/50 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-lg font-bold">
                  {crop.farmer.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-lg">{crop.farmer}</div>
                  <div className="text-sm text-primary flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-4 h-4" /> AgriBridge Verified ({crop.trust} Trust Score)
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
