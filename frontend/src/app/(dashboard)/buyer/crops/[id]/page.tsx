'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ShieldCheck, Calendar, Info, CornerDownRight, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CropImage } from '@/components/ui/crop-image';
import { WishlistButton } from '@/components/ui/wishlist-button';
import { DetailsSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CropCard } from '@/components/ui/crop-card';

interface CropDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default function CropDetailsPage({ params }: CropDetailsPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const cropId = resolvedParams.id;

  const [crop, setCrop] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buy Now Modal state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const fetchCropDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/crops/${cropId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCrop(data.data);
        setRelated(data.related || []);
      } else {
        setError(data.message || 'Crop not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch details. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCropDetails();
  }, [cropId]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error || !crop) {
    return (
      <div className="max-w-[1200px] mx-auto p-6 text-center">
        <EmptyState 
          icon={Info} 
          title="Listing Not Available" 
          description={error || "This crop listing may have been sold or removed."}
          ctaText="Back to Marketplace"
          ctaHref="/buyer/marketplace"
        />
      </div>
    );
  }

  const farmer = crop.farmerId;
  const isAvailableForDirectBuy = crop.status === 'listed' && crop.quantity > 0;
  const activeAuctionId = crop.activeAuctionId;

  const handleConfirmPurchase = async () => {
    if (buyQuantity <= 0 || buyQuantity > crop.quantity) {
      alert(`Please enter a quantity between 1 and ${crop.quantity}`);
      return;
    }

    setSubmittingOrder(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cropId: crop._id,
          quantity: buyQuantity
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrderSuccess(true);
        window.dispatchEvent(new Event('wishlist-updated'));
        setTimeout(() => {
          router.push('/buyer/orders');
        }, 1500);
      } else {
        alert(data.message || 'Failed to place sourcing order.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Link href="/buyer/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground truncate">{crop.name}</span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Image + Zoom Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-secondary border border-border/40 group shadow-md">
            <CropImage 
              images={crop.images} 
              alt={crop.name} 
              className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110 cursor-zoom-in" 
            />
            {crop.isOrganic && (
              <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                ORGANIC CERTIFIED
              </span>
            )}
          </div>
          
          {/* Gallery placeholders (for future multi-image support) */}
          <div className="grid grid-cols-4 gap-3">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-primary bg-muted">
              <CropImage images={crop.images} className="w-full h-full object-cover" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-border/40 bg-muted/30 flex items-center justify-center text-[10px] text-muted-foreground/40 font-bold">
                Photo {i + 2}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Crop Info & Sourcing Card */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-md">
                {crop.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mt-3">
                {crop.name} {crop.variety ? `(${crop.variety})` : ''}
              </h1>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>
                  {crop.farmerId?.location?.city || crop.farmerId?.location?.district || 'Nashik'}, {crop.farmerId?.location?.state || 'Maharashtra'}
                </span>
              </div>
            </div>

            {/* Farmer card */}
            <div className="p-4 bg-secondary/20 border border-border/50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                  {crop.farmerId?.name?.charAt(0) || 'F'}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Produced By</div>
                  <div className="text-sm font-bold text-foreground">{crop.farmerId?.name || 'Farmer'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-medium">Farmer Trust Score</div>
                <div className="flex items-center gap-1 justify-end font-extrabold text-sm text-emerald-500 mt-0.5">
                  <ShieldCheck className="w-4 h-4 fill-emerald-500 text-white" />
                  <span>{crop.farmerId?.trustScore || 0} Points</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-foreground">Product Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {crop.description || 'No description provided by the farmer. This crop was grown locally and complies with AgriBridge quality grading criteria.'}
              </p>
            </div>

            {/* Key specifications */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/10 border border-border/20 rounded-xl flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-[10px] text-muted-foreground block">Harvest Date</span>
                  <span className="text-xs font-bold text-foreground">
                    {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-secondary/10 border border-border/20 rounded-xl flex items-center gap-2.5">
                <Info className="w-4 h-4 text-primary" />
                <div>
                  <span className="text-[10px] text-muted-foreground block">Quality Grade</span>
                  <span className="text-xs font-bold text-foreground">{crop.qualityGrade || 'Grade A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Sourcing Actions Card */}
          <Card className="glass-card border-border/50 rounded-2xl shadow-md mt-6">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs text-muted-foreground uppercase block font-semibold">Direct Sourcing Price</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-heading font-extrabold text-foreground">₹{crop.pricePerUnit}</span>
                    <span className="text-sm text-muted-foreground">/ {crop.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground uppercase block font-semibold">Available Inventory</span>
                  <span className="text-base font-bold text-foreground mt-1 block">
                    {crop.quantity} {crop.unit}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {isAvailableForDirectBuy ? (
                  <Button 
                    onClick={() => setShowBuyModal(true)} 
                    className="flex-1 bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-xl text-sm transition-all"
                  >
                    Buy Now
                  </Button>
                ) : (
                  <Button 
                    disabled 
                    className="flex-1 bg-muted text-muted-foreground font-bold h-12 rounded-xl text-sm cursor-not-allowed border-none"
                  >
                    Sold Out
                  </Button>
                )}

                {activeAuctionId ? (
                  <Link href={`/buyer/auctions/${activeAuctionId}`} className="flex-1">
                    <Button 
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10"
                    >
                      Place Bid on Auction
                    </Button>
                  </Link>
                ) : null}

                <WishlistButton cropId={crop._id} showText className="h-12 border-border/50 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Crops Section */}
      {related.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h2 className="text-xl font-heading font-bold text-foreground">Related Category Crops</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((c) => (
              <CropCard key={c._id} crop={c} />
            ))}
          </div>
        </div>
      )}

      {/* Direct Buy Confirmation Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background border border-border/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-secondary/15">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">Confirm Sourcing Order</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{crop.name} Sourcing</p>
              </div>
              <button 
                onClick={() => setShowBuyModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {orderSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-foreground">Sourcing Order Placed!</h4>
                    <p className="text-xs text-muted-foreground mt-1">Redirecting you to order tracking...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground font-medium">Sourcing Unit Price</span>
                      <span className="text-sm font-bold text-foreground">₹{crop.pricePerUnit} / {crop.unit}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-muted-foreground font-medium">Sourcing Quantity ({crop.unit})</label>
                        <span className="text-xs text-muted-foreground">Max available: {crop.quantity}</span>
                      </div>
                      <Input 
                        type="number"
                        min={1}
                        max={crop.quantity}
                        value={buyQuantity}
                        onChange={(e) => setBuyQuantity(Math.min(crop.quantity, Math.max(1, Number(e.target.value))))}
                        className="bg-secondary/30"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Summary */}
                  <div className="flex justify-between items-end p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-wider block">Estimated Total</span>
                      <span className="text-2xl font-extrabold text-primary block mt-0.5">₹{crop.pricePerUnit * buyQuantity}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground font-semibold block">GST Surcharge</span>
                      <span className="text-xs text-muted-foreground font-bold">Included (0%)</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => setShowBuyModal(false)}
                      variant="outline"
                      className="flex-1 rounded-xl"
                      disabled={submittingOrder}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleConfirmPurchase}
                      className="flex-1 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl"
                      disabled={submittingOrder}
                    >
                      {submittingOrder ? 'Processing...' : 'Confirm Order'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
