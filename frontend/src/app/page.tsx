'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Stats } from '@/components/landing/Stats';
import { Features } from '@/components/landing/Features';
import { 
  fetchCrops, 
  fetchFAQs, 
  fetchTestimonials, 
  Crop, 
  FAQItem, 
  Testimonial 
} from '@/lib/mockService';
import { 
  ArrowRight, 
  Check, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Clock, 
  Sparkles, 
  Gavel, 
  Mail, 
  Phone, 
  Globe 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeAuctionBid, setActiveAuctionBid] = useState(4250);

  useEffect(() => {
    fetchCrops().then(data => setCrops(data.slice(0, 3)));
    fetchFAQs().then(setFaqs);
    fetchTestimonials().then(setTestimonials);

    // Dynamic bid simulation for auction preview
    const interval = setInterval(() => {
      setActiveAuctionBid(prev => prev + Math.floor(Math.random() * 150) + 50);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      <Navbar />
      <Hero />
      <Stats />
      
      {/* 1. Platform Benefits & Features */}
      <Features />

      {/* 2. How It Works Section */}
      <section id="how-it-works" className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium border-primary/20 text-primary">
              Simple & Secure
            </Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mt-4">
              How AgriBridge Works
            </h2>
            <p className="text-muted-foreground mt-4">
              Our end-to-end system streamlines trade, ensures instant payment, and optimizes delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { step: '01', title: 'Onboard & Verify', desc: 'Sign up as a Farmer, Buyer, Bank, or Logistics partner and quickly verify your KYC.' },
              { step: '02', title: 'List or Bid', desc: 'Farmers list harvests directly; buyers can buy immediately or bid in live auctions.' },
              { step: '03', title: 'Escrow Payment', desc: 'Buyers pay into a secure escrow system. Funds are locked safely.' },
              { step: '04', title: 'Smart Delivery', desc: 'Nearby pick-ups are routed dynamically, delivering crops and releasing funds.' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative flex flex-col gap-4 p-6 glass-card border-border/50 rounded-2xl"
              >
                <div className="text-5xl font-extrabold text-primary/10 font-heading">{item.step}</div>
                <h3 className="text-lg font-bold font-heading">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Marketplace Preview */}
      <section id="marketplace" className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium border-primary/20 text-primary">
                Marketplace Preview
              </Badge>
              <h2 className="text-3xl md:text-5xl font-heading font-bold mt-4">
                Explore Available Crops
              </h2>
            </div>
            <Link href="/signup?role=buyer">
              <Button className="bg-primary-gradient group">
                Browse Marketplace <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {crops.map((crop) => (
              <Card key={crop.id} className="glass-card overflow-hidden border-border/50 hover:shadow-lg transition-all group flex flex-col">
                <div className="relative h-48 overflow-hidden bg-muted">
                  <img src={crop.img} alt={crop.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
                  {crop.organic && <Badge className="absolute top-3 left-3 bg-primary/95">Organic</Badge>}
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <h3 className="font-heading font-bold text-lg mb-1">{crop.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <MapPin className="w-3.5 h-3.5" /> {crop.location}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Farmer</span>
                      <span className="text-sm font-semibold">{crop.farmer}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">₹{crop.price}</span>
                      <span className="text-xs text-muted-foreground"> / qtl</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Live Auction & AI Assistant Preview */}
      <section className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Live Auction Card Preview */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <div>
              <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium border-primary/20 text-primary">
                Live Auctions
              </Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mt-4">
                Real-Time Competitive Bidding
              </h2>
              <p className="text-muted-foreground mt-4">
                Our Redis-backed lock system ensures bids are updated instantly. Farmers get maximum crop value; buyers get absolute transparency.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-border/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <Badge variant="destructive" className="animate-pulse">LIVE AUCTION</Badge>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Gavel className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold">Grade A Sonalika Wheat</h4>
                  <span className="text-xs text-muted-foreground">Ends in 02h 45m</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-border/50">
                <div>
                  <span className="text-xs text-muted-foreground">Current Highest Bid</span>
                  <div className="text-2xl font-bold text-foreground">₹{activeAuctionBid.toLocaleString()}/qtl</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Total Bids Placed</span>
                  <div className="text-2xl font-bold text-primary">24 Bids</div>
                </div>
              </div>

              {/* Dynamic Bid History Mock */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-secondary/50 border border-border/30">
                  <span className="font-semibold">Buyer #893</span>
                  <span className="text-primary font-bold">₹{activeAuctionBid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-secondary/30">
                  <span className="text-muted-foreground">Buyer #102</span>
                  <span className="text-muted-foreground">₹{(activeAuctionBid - 100).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Advisor Preview */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <div>
              <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium border-primary/20 text-primary">
                AI Advisory
              </Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mt-4">
                Chat with KrishiSathi AI
              </h2>
              <p className="text-muted-foreground mt-4">
                Get direct access to agronomy advice, pest remedies, and regional price alerts.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-border/50 flex flex-col gap-4">
              <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm">KrishiSathi AI</h4>
                  <span className="text-[10px] text-primary flex items-center gap-1 font-medium">● Online</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="p-3 rounded-2xl bg-secondary/80 text-xs border border-border/30">
                    What is the market price of basmati rice today in Haryana?
                  </div>
                </div>
                <div className="flex gap-2 max-w-[85%] ml-auto flex-row-reverse">
                  <div className="p-3 rounded-2xl bg-primary text-primary-foreground text-xs">
                    Basmati rice is currently trading at ₹3,200/qtl in Karnal mandi, up 3% from yesterday. Arrival volumes are expected to increase next week, making this an ideal window to list your crop.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Pricing Plans */}
      <section id="pricing" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium border-primary/20 text-primary">
              Pricing Plans
            </Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mt-4">
              Transparent Commission
            </h2>
            <p className="text-muted-foreground mt-4">
              No hidden fees. We align our growth directly with your agricultural trade success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Farmers Plan */}
            <div className="glass-card p-8 rounded-3xl border border-primary/20 flex flex-col justify-between relative overflow-hidden bg-primary/[0.02]">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
              <div>
                <h3 className="text-2xl font-bold font-heading mb-2">For Farmers</h3>
                <p className="text-muted-foreground text-sm mb-6">Access buyers directly with zero listing fees.</p>
                <div className="text-4xl font-heading font-bold mb-6">1% <span className="text-sm text-muted-foreground font-normal">flat fee per sale</span></div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Free Crop Listings</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Free Live Auctions</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Multilingual AI Assistant</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Trust Profile Setup</li>
                </ul>
              </div>
              <Link href="/signup?role=farmer">
                <Button className="w-full bg-primary-gradient">Get Started as Farmer</Button>
              </Link>
            </div>

            {/* Buyers Plan */}
            <div className="glass-card p-8 rounded-3xl border border-border/50 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold font-heading mb-2">For Bulk Buyers</h3>
                <p className="text-muted-foreground text-sm mb-6">Bid on live auctions and source verified crops directly.</p>
                <div className="text-4xl font-heading font-bold mb-6">1% <span className="text-sm text-muted-foreground font-normal">take-rate + shipping</span></div>
                <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Real-time Bidding Room</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Escrow Secure Checkout</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Quality Grade Inspection Reports</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Route Optimized Freight Delivery</li>
                </ul>
              </div>
              <Link href="/signup?role=buyer">
                <Button className="w-full bg-secondary/80 text-foreground hover:bg-secondary border border-border/50">Get Started as Buyer</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Success Stories / Testimonials */}
      <section className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium border-primary/20 text-primary">
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mt-4">
              Empowering Real People
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((test, idx) => (
              <div key={idx} className="glass-card p-8 rounded-2xl border border-border/50 flex flex-col justify-between">
                <div>
                  <div className="text-primary font-heading font-bold text-lg mb-4">{test.impact}</div>
                  <p className="text-muted-foreground italic leading-relaxed text-[15px] mb-6">"{test.quote}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm">
                    {test.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{test.author}</div>
                    <div className="text-xs text-muted-foreground">{test.role} • {test.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium border-primary/20 text-primary">
              Got Questions?
            </Badge>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mt-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="group glass-card border border-border/50 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer select-none font-semibold text-foreground">
                  <span>{faq.question}</span>
                  <span className="transition-transform group-open:rotate-180">
                    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Contact Section */}
      <section id="contact" className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="glass-card rounded-3xl border border-border/50 p-8 lg:p-16 grid lg:grid-cols-2 gap-12 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div>
              <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium border-primary/20 text-primary">
                Get In Touch
              </Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mt-4">
                Partner with AgriBridge
              </h2>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed mb-8">
                Have questions about custom institutional solutions or API access? Connect with our dedicated support team.
              </p>

              <div className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary" /> support@agribridge.in</div>
                <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary" /> +91 (22) 555-0199</div>
                <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-primary" /> www.agribridge.in</div>
              </div>
            </div>

            <form onSubmit={e => e.preventDefault()} className="space-y-4 bg-background/50 p-6 rounded-2xl border border-border/30">
              <Input placeholder="Your Name" className="h-12 bg-background/60" />
              <Input placeholder="Email Address" type="email" className="h-12 bg-background/60" />
              <textarea placeholder="Your Message..." className="w-full h-32 p-4 rounded-xl border border-input bg-background/60 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" />
              <Button className="w-full h-12 bg-primary-gradient">Send Inquiry</Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/50 py-16 text-muted-foreground text-sm relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-white font-heading font-bold text-xl">
                  A
                </div>
                <span className="font-heading font-bold text-xl tracking-tight text-foreground">
                  AgriBridge
                </span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Empowering Indian farmers through real-time marketplace bidding, route-optimized logistics, and friction-free banking.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="#product" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="#marketplace" className="hover:text-primary transition-colors">Marketplace</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="#faq" className="hover:text-primary transition-colors">FAQs</Link></li>
                <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-heading font-semibold text-foreground mb-4">Newsletter</h4>
              <p className="text-xs text-muted-foreground">Subscribe to receive market price trends.</p>
              <div className="flex gap-2">
                <Input placeholder="Email Address" className="h-10 bg-background/50" />
                <Button size="sm" className="h-10 bg-primary-gradient px-4">Join</Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/30 text-xs gap-4">
            <p>© 2026 AgriBridge. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:underline">Privacy Policy</Link>
              <Link href="#" className="hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
