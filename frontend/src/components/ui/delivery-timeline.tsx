import React from 'react';
import { CheckCircle2, Circle, Truck, Package, Clock, ShieldAlert } from 'lucide-react';

interface DeliveryTimelineProps {
  status: string;
}

export function DeliveryTimeline({ status }: DeliveryTimelineProps) {
  const steps = [
    { label: 'Placed', key: 'pending', desc: 'Order received' },
    { label: 'Confirmed', key: 'confirmed', desc: 'Farmer confirmed' },
    { label: 'Picked Up', key: 'picked_up', desc: 'Driver collected' },
    { label: 'In Transit', key: 'in_transit', desc: 'On the road' },
    { label: 'Delivered', key: 'delivered', desc: 'Arrived at destination' }
  ];

  // Map backend delivery or order statuses to timeline index
  const getActiveIndex = (currentStatus: string) => {
    const s = currentStatus.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'in_transit') return 3;
    if (s === 'picked_up') return 2;
    if (s === 'confirmed' || s === 'accepted') return 1;
    return 0; // pending / unassigned
  };

  const activeIndex = getActiveIndex(status);
  const isCancelled = status.toLowerCase() === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Order Cancelled</h4>
          <p className="text-xs opacity-80">This order and delivery have been cancelled and refunded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      {/* Horizontal Line Stepper */}
      <div className="relative flex justify-between items-center w-full">
        {/* Line Background */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -translate-y-1/2 z-0" />
        
        {/* Active Line Progress */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              {/* Stepper Dot */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' 
                    : 'bg-muted border-2 border-border text-muted-foreground'
                } ${isActive ? 'ring-4 ring-primary/20' : ''}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-current" />
                )}
              </div>
              
              {/* Stepper Label */}
              <span className={`text-xs font-semibold mt-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
              
              {/* Stepper Description */}
              <span className="text-[10px] text-muted-foreground/60 hidden md:block mt-0.5 max-w-[80px] text-center">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
