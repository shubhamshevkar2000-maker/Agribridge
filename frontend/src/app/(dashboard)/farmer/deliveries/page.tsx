'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, CheckCircle2, Clock, Navigation, AlertTriangle, ArrowRight, CheckCircle, RotateCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Delivery {
  _id: string;
  orderId: {
    _id: string;
    cropId: { name: string; category: string };
  };
  pickupLocation: { coordinates: number[] };
  dropLocation: { coordinates: number[] };
  status: 'unassigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  logisticsPartnerId?: { name: string; phone: string };
  driverId?: { name: string; phone: string };
  createdAt: string;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDeliveries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/deliveries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDeliveries(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch deliveries', err);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const getStatusStep = (status: string) => {
    switch(status) {
      case 'unassigned': return 0;
      case 'accepted': return 1;
      case 'picked_up': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Truck className="w-8 h-8 text-primary" /> Logistics & Delivery
          </h1>
          <p className="text-muted-foreground mt-2">Track the real-time status of your crop shipments</p>
        </div>
        <Button 
          variant="outline" 
          className="glass border-primary/30 hover:bg-primary/10 transition-colors"
          onClick={() => { setRefreshing(true); fetchDeliveries(); }}
          disabled={refreshing || loading}
        >
          <RotateCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-3xl border-border/50">
          <Truck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold mb-2">No Active Deliveries</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You don't have any ongoing shipments. Once your crops are purchased, the logistics timeline will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {deliveries.map((delivery, i) => {
              const currentStep = getStatusStep(delivery.status);
              
              const steps = [
                { id: 'accepted', label: 'Assigned to Partner', icon: CheckCircle },
                { id: 'picked_up', label: 'Picked Up', icon: ArrowRight },
                { id: 'in_transit', label: 'In Transit', icon: Navigation },
                { id: 'delivered', label: 'Delivered', icon: MapPin },
              ];

              return (
                <motion.div
                  key={delivery._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass-card border-border/50 overflow-hidden">
                    <CardHeader className="bg-secondary/30 pb-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle className="text-xl">{delivery.orderId?.cropId?.name}</CardTitle>
                          {delivery.status === 'in_transit' && (
                            <Badge className="bg-primary animate-pulse px-2 py-0.5">MOVING</Badge>
                          )}
                          {delivery.status === 'delivered' && (
                            <Badge className="bg-emerald-500 px-2 py-0.5">COMPLETED</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="font-mono text-xs uppercase bg-muted px-2 py-1 rounded">ID: {delivery._id.substring(18)}</span>
                          • Placed on {new Date(delivery.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {delivery.logisticsPartnerId && (
                        <div className="text-right bg-background/50 p-3 rounded-xl border border-border/50">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Logistics Partner</p>
                          <p className="font-semibold text-sm">{delivery.logisticsPartnerId.name}</p>
                          <p className="text-xs text-primary">{delivery.driverId?.phone || delivery.logisticsPartnerId.phone}</p>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="p-6">
                      
                      {/* Timeline */}
                      <div className="relative pt-8 pb-4">
                        <div className="absolute top-12 left-0 right-0 h-1 bg-muted rounded-full">
                          <div 
                            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-in-out"
                            style={{ width: `${Math.max(0, (currentStep / 4) * 100)}%` }}
                          />
                        </div>
                        
                        <div className="relative flex justify-between">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground z-10 shadow-lg shadow-primary/20">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="mt-3 text-sm font-medium text-center w-24">Order Confirmed</div>
                          </div>
                          
                          {steps.map((step, idx) => {
                            const stepNumber = idx + 1;
                            const isCompleted = currentStep >= stepNumber;
                            const isActive = currentStep === stepNumber;
                            const Icon = step.icon;
                            
                            return (
                              <div key={step.id} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors duration-500 ${
                                  isCompleted 
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                                    : 'bg-muted text-muted-foreground border-2 border-background'
                                }`}>
                                  <Icon className={`w-5 h-5 ${isActive && 'animate-pulse'}`} />
                                </div>
                                <div className={`mt-3 text-sm text-center w-24 ${isCompleted ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                  {step.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
