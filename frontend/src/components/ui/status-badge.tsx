import React from 'react';
import { Badge } from './badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusStyle = (s: string) => {
    const term = s.toLowerCase();
    switch (term) {
      case 'listed':
      case 'completed':
      case 'delivered':
      case 'success':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'in_auction':
      case 'live':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse';
      case 'scheduled':
      case 'pending':
      case 'unassigned':
      case 'accepted':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'picked_up':
      case 'in_transit':
        return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'cancelled':
      case 'failed':
      case 'refunded':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  const formatStatus = (s: string) => {
    return s.replace('_', ' ').toUpperCase();
  };

  return (
    <Badge className={`shadow-none font-semibold text-xs px-2.5 py-0.5 rounded-full ${getStatusStyle(status)} ${className}`}>
      {formatStatus(status)}
    </Badge>
  );
}
