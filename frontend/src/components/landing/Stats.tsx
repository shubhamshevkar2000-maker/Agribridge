'use client';

import { useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/lib/translations';

const statConfig = [
  { value: 12500, suffix: '+', labelKey: 'statFarmers' as TranslationKey },
  { value: 45000, suffix: '+', labelKey: 'statCrops' as TranslationKey },
  { value: 850, prefix: '₹', suffix: 'Cr+', labelKey: 'statValue' as TranslationKey },
  { value: 120, prefix: '₹', suffix: 'Cr+', labelKey: 'statLoans' as TranslationKey },
];

function CountUp({ end, prefix = '', suffix = '' }: { end: number, prefix?: string, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number | null = null;
      const duration = 2000;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeProgress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, end]);

  return (
    <span ref={ref} className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function Stats() {
  const { t } = useLanguage();

  const stats = statConfig.map(stat => ({
    ...stat,
    label: t(stat.labelKey),
  }));

  return (
    <section className="py-16 border-y border-border/50 bg-secondary/30 relative">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <CountUp end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
