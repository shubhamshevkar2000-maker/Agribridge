'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Star, ShieldCheck, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';

const mockCrops = [
  { id: '1', title: 'Premium Red Tomatoes', farmer: 'Ramesh Kumar', location: 'Nashik, MH', price: 2350, qty: 50, img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80', trust: 850, organic: true },
  { id: '2', title: 'Organic Basmati Rice', farmer: 'Anil Desai', location: 'Karnal, HR', price: 3200, qty: 100, img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80', trust: 910, organic: true },
  { id: '3', title: 'Fresh Green Onions', farmer: 'Suresh Patel', location: 'Pune, MH', price: 1800, qty: 30, img: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80', trust: 820, organic: false },
  { id: '4', title: 'Nagpur Oranges (Grade A)', farmer: 'Vijay Singh', location: 'Nagpur, MH', price: 4500, qty: 25, img: 'https://images.unsplash.com/photo-1611080632333-934c9c148c3b?w=500&q=80', trust: 890, organic: true },
  { id: '5', title: 'Yellow Corn / Maize', farmer: 'Prakash Rao', location: 'Guntur, AP', price: 1950, qty: 200, img: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=500&q=80', trust: 840, organic: false },
  { id: '6', title: 'Fresh Potatoes', farmer: 'Kisan Mitra', location: 'Agra, UP', price: 1400, qty: 150, img: 'https://images.unsplash.com/photo-1518977676601-b14cf8a1d96f?w=500&q=80', trust: 780, organic: false },
];

export default function MarketplacePage() {
  const [priceRange, setPriceRange] = useState([1000, 5000]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto h-[calc(100vh-8rem)]">
      
      {/* Filters Sidebar */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6 h-full">
        <div className="glass-card p-5 rounded-2xl border border-border/50 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 font-heading font-bold text-lg mb-6 text-foreground">
            <Filter className="w-5 h-5" /> Filters
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">Crop Category</h4>
              <div className="space-y-2">
                {['Vegetables', 'Fruits', 'Grains', 'Spices'].map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    <Checkbox /> {cat}
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
                onValueChange={setPriceRange}
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
                <Checkbox /> Organic Certified
              </label>
            </div>
            
            <div className="h-px bg-border/50" />

            <div>
              <h4 className="font-semibold text-sm mb-3">Trust Score (Min)</h4>
              <div className="space-y-2">
                {[800, 850, 900].map(score => (
                  <label key={score} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    <Checkbox /> {score}+ Score
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search crops, farmers, or locations..." className="pl-10 h-12 bg-secondary/30 border-border/50" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="glass h-12">Sort by: Relevancy</Button>
          </div>
        </div>

        {/* Grid Scroll Area */}
        <div className="flex-1 overflow-y-auto pb-8 pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockCrops.map((crop, i) => (
              <motion.div
                key={crop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link href={`/buyer/marketplace/${crop.id}`}>
                  <Card className="glass-card overflow-hidden border-border/50 hover:shadow-lg hover:border-primary/30 transition-all group h-full flex flex-col cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={crop.img} 
                        alt={crop.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {crop.organic && <Badge className="bg-primary/90 hover:bg-primary shadow-sm backdrop-blur-md">Organic</Badge>}
                      </div>
                      <button className="absolute top-3 right-3 p-2 bg-background/50 hover:bg-background/80 backdrop-blur-md rounded-full text-muted-foreground hover:text-destructive transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-heading font-bold text-lg leading-tight line-clamp-1">{crop.title}</h3>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{crop.location}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                            {crop.farmer.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium truncate w-24">{crop.farmer}</span>
                            <span className="text-[10px] text-primary flex items-center gap-0.5 font-semibold">
                              <ShieldCheck className="w-3 h-3" /> {crop.trust} Trust
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-foreground">₹{crop.price}</div>
                          <div className="text-xs text-muted-foreground">{crop.qty} Qtl Avail.</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
