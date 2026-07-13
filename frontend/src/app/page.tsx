'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { Features } from '@/components/landing/Features';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <section id="product" className="py-20 bg-secondary/10 text-center"><div className="container">Product Details Coming Soon</div></section>
      <section id="marketplace" className="py-20 text-center"><div className="container">Marketplace Sneak Peek Coming Soon</div></section>
      <section id="pricing" className="py-20 bg-secondary/10 text-center"><div className="container">Pricing Information Coming Soon</div></section>
      <section id="how-it-works" className="py-20 text-center"><div className="container">How It Works Details Coming Soon</div></section>
      <section id="faq" className="py-20 bg-secondary/10 text-center"><div className="container">FAQ Coming Soon</div></section>
      
      {/* Footer minimal placeholder */}
      <footer className="border-t border-border bg-secondary/30 py-12 text-center text-muted-foreground text-sm">
        <div className="container mx-auto px-6">
          <p>© 2026 AgriBridge. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
