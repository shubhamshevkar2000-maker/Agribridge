import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

export function EmptyState({ icon: Icon, title, description, ctaText, ctaHref, onCtaClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-16 bg-secondary/10 border border-dashed border-border/60 rounded-3xl text-center max-w-xl mx-auto my-8">
      <div className="p-4 bg-primary/5 rounded-full mb-6">
        <Icon className="w-12 h-12 text-primary/60" />
      </div>
      <h3 className="text-xl font-heading font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {ctaText && onCtaClick && (
        <Button onClick={onCtaClick} className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">
          {ctaText}
        </Button>
      )}
      {ctaText && ctaHref && !onCtaClick && (
        <Link href={ctaHref}>
          <Button className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">
            {ctaText}
          </Button>
        </Link>
      )}
    </div>
  );
}
