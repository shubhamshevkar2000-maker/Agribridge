'use client';

import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  CheckCircle,
  Truck,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock Stops
const stops = [
  { id: 1, type: 'pickup', title: 'Pickup: Farm A', location: 'Nashik, MH', time: '10:00 AM', completed: true },
  { id: 2, type: 'pickup', title: 'Pickup: Farm B', location: 'Ozar, MH', time: '11:30 AM', completed: false, current: true },
  { id: 3, type: 'dropoff', title: 'Dropoff: AgroFoods Ltd.', location: 'Mumbai, MH', time: '4:00 PM', completed: false },
];

export default function LogisticsDashboard() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto h-[calc(100vh-8rem)]">
      
      {/* Left Column: Itinerary */}
      <div className="w-full lg:w-96 shrink-0 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-8">
        
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-heading">Route MH-104</CardTitle>
            <CardDescription>Multi-stop optimized route</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-xl border border-border/50">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">Vehicle: MH15 AB 1234</div>
                <div className="text-xs text-muted-foreground">Driver: Raju Patil</div>
              </div>
            </div>

            <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
              
              {stops.map((stop) => (
                <div key={stop.id} className="relative z-10 flex gap-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5 ${
                    stop.completed 
                      ? 'bg-primary border-primary text-white' 
                      : stop.current 
                        ? 'bg-background border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                        : 'bg-background border-border text-muted-foreground'
                  }`}>
                    {stop.completed ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  
                  <div className={`flex flex-col flex-1 p-4 rounded-xl border ${stop.current ? 'bg-blue-500/5 border-blue-500/30' : 'bg-background border-border/50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className={`font-semibold ${stop.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {stop.title}
                      </div>
                      <Badge variant="outline" className={stop.type === 'pickup' ? 'text-orange-500 border-orange-500/30' : 'text-green-500 border-green-500/30'}>
                        {stop.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" /> {stop.location}
                      <Clock className="w-3 h-3 ml-2" /> {stop.time}
                    </div>
                    {stop.current && (
                      <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-2">
                        Mark Arrived
                      </Button>
                    )}
                  </div>
                </div>
              ))}

            </div>
          </CardContent>
        </Card>

      </div>

      {/* Right Column: Interactive Map Mock */}
      <div className="flex-1 flex flex-col h-full overflow-hidden rounded-3xl border border-border/50 bg-secondary/20 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-20 dark:opacity-5 mix-blend-overlay pointer-events-none" />
        
        {/* Mock Map UI overlay */}
        <div className="absolute top-4 left-4 z-10 glass-card p-4 rounded-xl border border-border/50 shadow-lg">
          <h3 className="font-heading font-bold mb-1">Live Tracking</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-blue-500" /> Navigating to Farm B (15 mins away)
          </p>
        </div>

        <div className="absolute bottom-4 right-4 z-10">
          <Button className="bg-primary-gradient shadow-lg">
            <Navigation className="w-4 h-4 mr-2" /> Open in Maps
          </Button>
        </div>

        {/* Central Map Illustration Mock */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
           {/* Connecting Line */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
             <path d="M 30% 40% Q 50% 20% 70% 60%" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8 8" className="animate-[dash_20s_linear_infinite]" />
           </svg>
           
           <motion.div 
             initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
             className="absolute left-[30%] top-[40%] w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-lg -translate-x-1/2 -translate-y-1/2"
           >
             <CheckCircle className="w-4 h-4" />
           </motion.div>

           <motion.div 
             initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}
             className="absolute left-[50%] top-[30%] w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] -translate-x-1/2 -translate-y-1/2 animate-bounce"
           >
             <Truck className="w-4 h-4" />
           </motion.div>

           <motion.div 
             initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }}
             className="absolute left-[70%] top-[60%] w-6 h-6 rounded-full bg-background border-4 border-destructive shadow-lg -translate-x-1/2 -translate-y-1/2"
           />
        </div>
      </div>

    </div>
  );
}
