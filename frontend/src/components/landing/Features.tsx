'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Gavel, Truck, Cpu, ShieldCheck, Store, ClipboardCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/lib/translations';

const featureIcons = [Gavel, Truck, Cpu, ShieldCheck, Store, ClipboardCheck];
const featureTitleKeys: TranslationKey[] = ['feature1Title', 'feature2Title', 'feature3Title', 'feature4Title', 'feature5Title', 'feature6Title'];
const featureDescKeys: TranslationKey[] = ['feature1Desc', 'feature2Desc', 'feature3Desc', 'feature4Desc', 'feature5Desc', 'feature6Desc'];

export function Features() {
  const { t } = useLanguage();

  const features = featureIcons.map((icon, i) => ({
    title: t(featureTitleKeys[i]),
    description: t(featureDescKeys[i]),
    icon,
  }));

  return (
    <section id="product" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            {t('featuresTitle')} <span className="text-gradient">{t('featuresTitleGradient')}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('featuresDesc')}
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
