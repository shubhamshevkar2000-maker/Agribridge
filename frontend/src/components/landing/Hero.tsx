'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Leaf, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50" />

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 items-start"
        >
          <Badge variant="outline" className="glass px-4 py-1.5 rounded-full text-sm font-medium border-primary/20 text-primary dark:text-accent">
            ✨ {t('heroBadge')}
          </Badge>
          
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold leading-[1.1] tracking-tight text-foreground">
            {t('heroTitle1')} <span className="text-gradient">{t('heroTitle2')}</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl">
            {t('heroDesc')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link href="/signup?role=farmer">
              <Button size="lg" className="w-full sm:w-auto bg-primary-gradient text-white h-14 px-8 text-base rounded-xl hover:scale-[1.02] transition-transform">
                {t('heroJoinFarmer')} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="w-full sm:w-auto glass-card h-14 px-8 text-base rounded-xl hover:scale-[1.02] transition-transform">
                {t('heroExploreMarket')}
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[500px] w-full hidden lg:block"
        >
          {/* Parallax mock dashboard pieces */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="absolute top-10 right-10 z-20 w-64 glass-card p-4 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="font-heading font-semibold text-sm">{t('heroLiveAuction')}</div>
              <Badge variant="destructive" className="animate-pulse">{t('heroLIVE')}</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">₹4,250<span className="text-sm text-muted-foreground font-normal">/qtl</span></div>
            <div className="text-xs text-muted-foreground mb-4">{t('heroHighestBid')}</div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent w-3/4" />
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }} 
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 left-0 z-10 w-72 glass-card p-5 rounded-2xl"
          >
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-primary/10 rounded-xl text-primary">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <div className="font-heading font-semibold">{t('heroKrishiSathi')}</div>
                <div className="text-xs text-muted-foreground">{t('heroCropAdvisory')}</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-secondary/50 rounded-xl text-sm leading-relaxed border border-border/50">
              {t('heroTomatoTip')}
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 right-0 z-0 w-48 glass-card p-4 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-primary mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">{t('heroTrustScore')}</span>
            </div>
            <div className="text-4xl font-heading font-bold">850</div>
            <div className="text-xs text-muted-foreground mt-1">{t('heroExcellentTier')}</div>
          </motion.div>

          {/* Central decorative element */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full border border-white/10 dark:border-white/5 backdrop-blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
