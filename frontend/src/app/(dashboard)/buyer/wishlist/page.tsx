'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { CropCard } from '@/components/ui/crop-card';
import { GridSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface Crop {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  isOrganic: boolean;
  images?: string[];
  farmerId?: {
    _id: string;
    name: string;
    trustScore?: number;
    location?: {
      city?: string;
      district?: string;
      state?: string;
    };
  };
}

export default function BuyerWishlistPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCrops(data.data);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();

    const handleWishlistUpdate = () => {
      // Fetch without global blocking loading indicator for smoother feel
      fetchWishlist(false);
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
          <Heart className="w-8 h-8 text-destructive fill-destructive" /> My Wishlist
        </h1>
        <p className="text-muted-foreground mt-1">Crops you saved for future sourcing or volume buying.</p>
      </div>

      {loading ? (
        <GridSkeleton count={4} />
      ) : crops.length === 0 ? (
        <EmptyState 
          icon={Heart} 
          title="Your Wishlist is Empty" 
          description="You haven't saved any crops yet. Explore the marketplace to find high-quality farm produce."
          ctaText="Browse Marketplace"
          ctaHref="/buyer/marketplace"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crops.map((crop) => (
            <CropCard key={crop._id} crop={crop} />
          ))}
        </div>
      )}
    </div>
  );
}
