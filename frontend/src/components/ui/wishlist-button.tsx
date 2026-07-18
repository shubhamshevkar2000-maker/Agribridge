import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from './button';

interface WishlistButtonProps {
  cropId: string;
  className?: string;
  showText?: boolean;
}

export function WishlistButton({ cropId, className = '', showText = false }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const isSaved = data.data.some((item: any) => item._id === cropId);
        setIsWishlisted(isSaved);
      }
    } catch (err) {
      console.error('Error checking wishlist status:', err);
    }
  };

  useEffect(() => {
    checkWishlistStatus();
  }, [cropId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    // Optimistic Update
    const previousState = isWishlisted;
    setIsWishlisted(!previousState);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to manage wishlist');
        setIsWishlisted(previousState);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/wishlist/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cropId })
      });
      const data = await res.json();
      if (data.success) {
        setIsWishlisted(data.wishlisted);
        // Trigger global event for navbar/sidebar count updates
        window.dispatchEvent(new Event('wishlist-updated'));
      } else {
        setIsWishlisted(previousState);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      setIsWishlisted(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant="outline"
      className={`rounded-xl border-border/50 hover:bg-destructive/10 hover:text-destructive transition-all flex items-center gap-2 ${
        isWishlisted ? 'text-destructive border-destructive/30 bg-destructive/5' : 'text-muted-foreground'
      } ${className}`}
    >
      <Heart className={`w-4 h-4 transition-transform active:scale-75 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`} />
      {showText && (isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist')}
    </Button>
  );
}
