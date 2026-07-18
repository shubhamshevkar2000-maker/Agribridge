'use client';

import { useState, useEffect } from 'react';
import { Store, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
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
  qualityGrade?: string;
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
  location?: {
    type: string;
    coordinates: number[];
  };
  images?: string[];
  createdAt: string;
}

export default function MarketplacePage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [priceRange, setPriceRange] = useState([100, 10000]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('All');
  const [isOrganic, setIsOrganic] = useState(false);
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [minQuantity, setMinQuantity] = useState('');

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (isOrganic) params.append('isOrganic', 'true');
      if (search) params.append('search', search);

      params.append('minPrice', priceRange[0].toString());
      params.append('maxPrice', priceRange[1].toString());

      if (district) params.append('district', district);
      if (state) params.append('state', state);
      if (pincode) params.append('pincode', pincode);
      if (minQuantity) params.append('minQuantity', minQuantity);

      const res = await fetch(`/api/crops?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCrops(data.data);
      }
    } catch (err) {
      console.error('Error fetching crops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [category, isOrganic, search, priceRange, district, state, pincode, minQuantity]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setIsOrganic(false);
    setPriceRange([100, 10000]);
    setDistrict('');
    setState('');
    setPincode('');
    setMinQuantity('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto p-4 md:p-6">
      
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
              <h4 className="font-semibold text-sm mb-3">Price Range (₹/unit)</h4>
              <Slider 
                defaultValue={[100, 10000]} 
                max={10000} 
                step={50}
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
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground mb-4">
                <Checkbox checked={isOrganic} onCheckedChange={(c) => setIsOrganic(!!c)} /> Organic Certified
              </label>
            </div>

            <div className="h-px bg-border/50" />

            <div>
              <h4 className="font-semibold text-sm mb-3">Location Details</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">District</label>
                  <Input 
                    placeholder="e.g. Pune" 
                    value={district} 
                    onChange={(e) => setDistrict(e.target.value)}
                    className="h-9 bg-secondary/30 border-border/50 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">State</label>
                  <Input 
                    placeholder="e.g. Maharashtra" 
                    value={state} 
                    onChange={(e) => setState(e.target.value)}
                    className="h-9 bg-secondary/30 border-border/50 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Pincode</label>
                  <Input 
                    placeholder="e.g. 411001" 
                    value={pincode} 
                    onChange={(e) => setPincode(e.target.value)}
                    className="h-9 bg-secondary/30 border-border/50 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-border/50" />

            <div>
              <h4 className="font-semibold text-sm mb-3">Required Quantity</h4>
              <Input 
                type="number"
                placeholder="Min quantity" 
                value={minQuantity} 
                onChange={(e) => setMinQuantity(e.target.value)}
                className="h-9 bg-secondary/30 border-border/50 rounded-lg text-sm"
              />
            </div>
            
            <Button onClick={resetFilters} variant="outline" className="w-full text-xs font-semibold h-9 rounded-lg mt-2">
              Clear All Filters
            </Button>
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
              className="pl-10 h-12 bg-secondary/30 border-border/50 rounded-xl" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="glass h-12 rounded-xl">Sort by: Relevancy</Button>
          </div>
        </div>

        {/* Grid Scroll Area */}
        <div className="pb-8 pr-2">
          {loading ? (
            <GridSkeleton count={6} />
          ) : crops.length === 0 ? (
            <EmptyState 
              icon={Store} 
              title="No Crops Found" 
              description="We couldn't find any crops matching your criteria. Try adjusting filters or refresh the marketplace."
              ctaText="Reset Filters"
              ctaHref="#"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {crops.map((crop) => (
                <CropCard key={crop._id} crop={crop} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
