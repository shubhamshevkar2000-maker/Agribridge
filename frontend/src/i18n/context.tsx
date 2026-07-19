'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, defaultLocale, locales } from './config';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import mr from '@/locales/mr.json';

const translations: Record<Locale, typeof en> = { en, hi, mr };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part];
    }
    return undefined;
  }, obj) ?? path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('agribridge_locale') as Locale | null;
    if (saved && locales.includes(saved)) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('agribridge_locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback((key: string): string => {
    return getNestedValue(translations[locale], key);
  }, [locale]);

  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale: defaultLocale, setLocale, t: (key) => getNestedValue(translations[defaultLocale], key) }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
