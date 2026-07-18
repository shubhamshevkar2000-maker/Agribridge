import React from 'react';
import { Card, CardContent } from './card';

export function CardSkeleton() {
  return (
    <Card className="glass-card overflow-hidden border-border/50 rounded-2xl flex flex-col h-full animate-pulse">
      <div className="h-40 bg-muted/60 w-full" />
      <CardContent className="p-4 flex-1 space-y-4">
        <div className="h-5 bg-muted/60 rounded w-2/3" />
        <div className="h-4 bg-muted/60 rounded w-1/2" />
        <div className="h-px bg-border/50" />
        <div className="flex justify-between items-center pt-2">
          <div className="space-y-1 w-1/3">
            <div className="h-3 bg-muted/60 rounded" />
            <div className="h-4 bg-muted/60 rounded w-5/6" />
          </div>
          <div className="space-y-1 w-1/3 text-right flex flex-col items-end">
            <div className="h-4 bg-muted/60 rounded w-full" />
            <div className="h-3 bg-muted/60 rounded w-2/3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 space-y-8 animate-pulse">
      <div className="h-6 bg-muted/60 rounded w-1/4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[400px] bg-muted/60 rounded-3xl" />
        <div className="space-y-6">
          <div className="h-10 bg-muted/60 rounded w-3/4" />
          <div className="h-6 bg-muted/60 rounded w-1/3" />
          <div className="h-24 bg-muted/60 rounded w-full" />
          <div className="h-px bg-border/50" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-muted/60 rounded" />
            <div className="h-12 bg-muted/60 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
