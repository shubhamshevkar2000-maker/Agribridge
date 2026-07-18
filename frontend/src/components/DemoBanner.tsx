'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DemoBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user?.isDemoAccount) {
      const isDismissed = sessionStorage.getItem('demo_banner_dismissed') === 'true';
      if (!isDismissed) {
        setIsVisible(true);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('demo_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3 text-amber-500 text-sm font-medium z-40 transition-all duration-300">
      <div className="flex items-center gap-2 max-w-[90%] mx-auto md:mx-0">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
        <span className="leading-tight">
          You are using a Demo Account. Any changes made during this session may be reset.
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDismiss}
        className="w-7 h-7 hover:bg-amber-500/10 text-amber-500 hover:text-amber-600 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
