'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Star, ShieldCheck, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

// Define our Crop interface mapping to backend data
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
    trustScore?: number;
    location?: {
      type: string;
      coordinates: number[];
    };
  };
  location?: {
    type: string;
    coordinates: number[];
  };
  images?: string[];
  createdAt: string;
}

export default function MarketplacePage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [priceRange, setPriceRange] = useState([1000, 5000]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [isOrganic, setIsOrganic] = useState(false);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (isOrganic) params.append('isOrganic', 'true');
      if (search) params.append('search', search);

      const res = await fetch(`http://localhost:5000/api/crops?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Filter by price range locally since backend doesn't support it yet
        const filtered = data.data.filter((c: Crop) => c.pricePerUnit >= priceRange[0] && c.pricePerUnit <= priceRange[1]);
        setCrops(filtered);
      }
    } catch (err) {
      console.error('Error fetching crops:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCrops();
  }, [category, isOrganic, search, priceRange]); // re-fetch when filters change

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto">
      
      {/* Filters Sidebar */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6">
        <div className="glass-card p-5 rounded-2xl border border-border/50">
          <div className="flex items-center gap-2 font-heading font-bold text-lg mb-6 text-foreground">
            <Filter className="w-5 h-5" /> Filters
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">Crop Category</h4>
              <div className="space-y-2">
                {['All', 'Vegetables', 'Fruits', 'Grains', 'Spices'].map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    <Checkbox checked={category === cat} onCheckedChange={() => setCategory(cat)} /> {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-border/50" />

            <div>
              <h4 className="font-semibold text-sm mb-3">Price Range (₹/qtl)</h4>
              <Slider 
                defaultValue={[1000, 5000]} 
                max={10000} 
                step={100}
                value={priceRange}
                onValueChange={(val) => {
                  if (Array.isArray(val)) {
                    setPriceRange(val as number[]);
                  }
                }}
                className="mb-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>

            <div className="h-px bg-border/50" />

            <div>
              <h4 className="font-semibold text-sm mb-3">Certifications</h4>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                <Checkbox checked={isOrganic} onCheckedChange={(c) => setIsOrganic(!!c)} /> Organic Certified
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search crops..." 
              className="pl-10 h-12 bg-secondary/30 border-border/50" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="glass h-12">Sort by: Relevancy</Button>
          </div>
        </div>

        {/* Grid Scroll Area */}
        <div className="pb-8 pr-2">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
          ) : crops.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">No crops are currently listed in the marketplace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {crops.map((crop, i) => {
                const cropLocation = crop.location?.coordinates || crop.farmerId?.location?.coordinates;
                const locationText = cropLocation ? `Coords: ${cropLocation.join(', ')}` : 'Location: Not Available';
                const trustScoreText = crop.farmerId?.trustScore !== undefined && crop.farmerId?.trustScore !== null
                  ? `${crop.farmerId.trustScore} Trust`
                  : 'Trust: Not Available';

                return (
                  <motion.div
                    key={crop._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link href={`/buyer/marketplace/${crop._id}`}>
                      <Card className="glass-card overflow-hidden border-border/50 hover:shadow-lg hover:border-primary/30 transition-all group h-full flex flex-col cursor-pointer">
                        <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
                          {crop.images && crop.images.length > 0 ? (
                            <img src={crop.images[0]} alt={crop.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full w-full bg-secondary/30 text-muted-foreground">
                              <Search className="w-8 h-8 mb-2 opacity-40" />
                              <span className="text-xs uppercase tracking-wider font-semibold font-heading">No Image</span>
                            </div>
                          )}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {crop.isOrganic && <Badge className="bg-primary/90 hover:bg-primary shadow-sm backdrop-blur-md">Organic</Badge>}
                          </div>
                          <button onClick={(e) => { e.preventDefault(); /* stub */ }} className="absolute top-3 right-3 p-2 bg-background/50 hover:bg-background/80 backdrop-blur-md rounded-full text-muted-foreground hover:text-destructive transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <CardContent className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-heading font-bold text-lg leading-tight line-clamp-1">{crop.name}</h3>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate text-xs">{locationText}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                                {crop.farmerId?.name?.charAt(0) || 'F'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-medium truncate w-24">{crop.farmerId?.name || 'Unknown'}</span>
                                <span className="text-[10px] text-primary flex items-center gap-0.5 font-semibold">
                                  <ShieldCheck className="w-3 h-3" /> {trustScoreText}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-foreground">₹{crop.pricePerUnit}</div>
                              <div className="text-xs text-muted-foreground">{crop.quantity} {crop.unit} Avail.</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
