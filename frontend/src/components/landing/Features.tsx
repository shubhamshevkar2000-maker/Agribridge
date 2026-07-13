'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Gavel, Truck, Cpu, ShieldCheck, Store, Mic } from 'lucide-react';

const features = [
  {
    title: 'Live Auctions',
    description: 'Bypass middlemen and sell your harvest through real-time bidding to verified buyers.',
    icon: Gavel,
  },
  {
    title: 'Smart Logistics',
    description: 'Optimize multi-farmer pickup routes and share truck costs transparently.',
    icon: Truck,
  },
  {
    title: 'KrishiSathi AI',
    description: 'Get instant crop advisory, disease detection, and price predictions in your local language.',
    icon: Cpu,
  },
  {
    title: 'AgriCredit Scoring',
    description: 'Build a trustworthy credit profile based on your transaction history to access institutional loans.',
    icon: ShieldCheck,
  },
  {
    title: 'Direct Marketplace',
    description: 'A nationwide platform connecting farmers and bulk buyers securely and transparently.',
    icon: Store,
  },
  {
    title: 'Multilingual Voice AI',
    description: 'Interact with the platform using simple voice commands in English, Hindi, and Marathi.',
    icon: Mic,
  },
];

export function Features() {
  return (
    <section id="product" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            A Complete <span className="text-gradient">Agri-Ecosystem</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to sell smarter, deliver faster, and grow your agricultural business securely.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="glass-card h-full transition-shadow hover:shadow-[0_8px_30px_rgb(15,81,50,0.12)] border-border/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
