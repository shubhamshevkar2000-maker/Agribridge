'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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

export default function BuyerSearchPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(false);

  // Advanced search/filter states
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [isOrganic, setIsOrganic] = useState(false);
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (keyword) params.append('search', keyword);
      if (category) params.append('category', category);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minQuantity) params.append('minQuantity', minQuantity);
      if (isOrganic) params.append('isOrganic', 'true');
      if (district) params.append('district', district);
      if (state) params.append('state', state);
      if (pincode) params.append('pincode', pincode);

      const res = await fetch(`/api/crops?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCrops(data.data);
      }
    } catch (err) {
      console.error('Error searching crops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCrops();
  };

  const handleClearFilters = () => {
    setKeyword('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinQuantity('');
    setIsOrganic(false);
    setDistrict('');
    setState('');
    setPincode('');
    setTimeout(fetchCrops, 50);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Advanced Crop Search</h1>
        <p className="text-muted-foreground mt-1">Locate specific crops, filter by regions, certifications, quantities or price bounds.</p>
      </div>

      <Card className="glass-card border-border/50 p-6 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input 
                placeholder="Search crop name (e.g., Rice, Onion, Garlic)..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10 h-12 bg-secondary/30 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 gap-2 rounded-xl"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </Button>
              <Button type="submit" className="h-12 bg-primary hover:bg-primary/90 text-white rounded-xl px-6">
                Search
              </Button>
            </div>
          </div>

          {showAdvanced && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select 
                  className="w-full h-10 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Spices">Spices</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Price Bounds (₹/unit)</label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-10 bg-secondary/30 text-sm"
                  />
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-10 bg-secondary/30 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Location Details</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="District" 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                    className="h-10 bg-secondary/30 text-sm"
                  />
                  <Input 
                    placeholder="State" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)}
                    className="h-10 bg-secondary/30 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Minimum Quantity</label>
                <Input 
                  type="number" 
                  placeholder="Min quantity" 
                  value={minQuantity} 
                  onChange={(e) => setMinQuantity(e.target.value)}
                  className="h-10 bg-secondary/30 text-sm"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  <input 
                    type="checkbox" 
                    checked={isOrganic} 
                    onChange={(e) => setIsOrganic(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary"
                  /> 
                  Organic Certified Crops Only
                </label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="text-xs text-muted-foreground hover:text-foreground h-8"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-heading font-bold text-foreground">
          {crops.length} Search Results
        </h2>
        
        {loading ? (
          <GridSkeleton count={8} />
        ) : crops.length === 0 ? (
          <EmptyState 
            icon={Search} 
            title="No Results Found" 
            description="We couldn't find any crop matching your filters. Try clearing some filters or searching for something else."
            ctaText="Clear Search Filters"
            ctaHref="#"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {crops.map((crop) => (
              <CropCard key={crop._id} crop={crop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
