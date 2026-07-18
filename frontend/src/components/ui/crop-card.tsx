import React from 'react';
import { MapPin, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { CropImage } from './crop-image';
import { WishlistButton } from './wishlist-button';
import Link from 'next/link';

interface CropCardProps {
  crop: {
    _id: string;
    name: string;
    variety?: string;
    category: string;
    images?: string[];
    pricePerUnit: number;
    unit: string;
    quantity: number;
    isOrganic?: boolean;
    farmerId?: {
      _id: string;
      name: string;
      trustScore?: number;
      location?: {
        district?: string;
        state?: string;
      };
    };
  };
}

export function CropCard({ crop }: CropCardProps) {
  const farmer = crop.farmerId;
  const district = farmer?.location?.district || 'Unknown Location';
  const state = farmer?.location?.state || '';

  return (
    <Card className="glass-card overflow-hidden border-border/50 rounded-2xl flex flex-col h-full hover:shadow-lg transition-all group">
      {/* Crop image + Wishlist Overlay */}
      <div className="relative h-44 w-full overflow-hidden bg-muted">
        <CropImage images={crop.images} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        
        {/* Organic Badge */}
        {crop.isOrganic && (
          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
            ORGANIC
          </span>
        )}

        {/* Wishlist Toggle Button overlay */}
        <div className="absolute top-3 right-3">
          <WishlistButton cropId={crop._id} className="h-8 w-8 p-0 bg-white/90 backdrop-blur border-none hover:bg-white hover:scale-105" />
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        {/* Title and Category */}
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary/80">
            {crop.category}
          </span>
          <h3 className="font-heading font-bold text-base text-foreground line-clamp-1 mt-0.5">
            {crop.name} {crop.variety ? `(${crop.variety})` : ''}
          </h3>

          {/* Farmer summary */}
          {farmer && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span className="font-semibold line-clamp-1">{farmer.name}</span>
              {farmer.trustScore !== undefined && (
                <div className="flex items-center gap-0.5 bg-primary/5 text-primary px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                  <ShieldCheck className="w-3 h-3 fill-primary text-white" />
                  <span>{farmer.trustScore}</span>
                </div>
              )}
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
            <span className="line-clamp-1">{district}{state ? `, ${state}` : ''}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 my-3" />

        {/* Pricing and Action */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
              Price ({crop.unit})
            </span>
            <span className="font-heading font-extrabold text-lg text-foreground">
              ₹{crop.pricePerUnit}
            </span>
            <span className="text-[10px] text-muted-foreground ml-1">
              / {crop.unit}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
              Available
            </span>
            <span className="font-bold text-sm text-foreground">
              {crop.quantity} {crop.unit}
            </span>
          </div>
        </div>

        {/* View Details full width button */}
        <div className="mt-4">
          <Link href={`/buyer/crops/${crop._id}`} className="w-full">
            <Button className="w-full bg-primary hover:bg-primary/95 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm group-hover:gap-2">
              View Details
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
