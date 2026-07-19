'use client';

import { useState, useEffect } from 'react';
import { Heart, Search, ArrowRight, RefreshCw } from 'lucide-react';
import { CropCard } from '@/components/ui/crop-card';
import { GridSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FavoritesPage() {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCrops(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch wishlist');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching your wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    
    // Listen for wishlist updates
    const handleWishlistUpdated = () => {
      fetchWishlist();
    };
    
    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdated);
    };
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" /> Saved Crops
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track your wishlisted items.</p>
        </div>
        <Link href="/buyer/marketplace">
          <Button variant="outline" className="glass h-12 rounded-xl">
            <Search className="w-4 h-4 mr-2" /> Browse More
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <Heart className="w-12 h-12 text-destructive/50" />
          <h3 className="text-xl font-heading font-bold">Failed to Load</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
          <Button onClick={fetchWishlist} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      ) : loading ? (
        <GridSkeleton count={4} />
      ) : crops.length === 0 ? (
        <EmptyState 
          icon={Heart} 
          title="Your Wishlist is Empty" 
          description="You haven't saved any crops yet. Click the heart icon on any crop in the marketplace to save it here for later."
          ctaText="Explore Marketplace"
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
