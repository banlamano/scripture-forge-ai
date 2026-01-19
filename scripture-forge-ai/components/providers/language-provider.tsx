"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { locales, defaultLocale, localeNames, type Locale } from '@/lib/i18n';

// Import all message files statically for client-side use
import enMessages from '@/messages/en.json';
import esMessages from '@/messages/es.json';
import frMessages from '@/messages/fr.json';
import deMessages from '@/messages/de.json';
import ptMessages from '@/messages/pt.json';
import zhMessages from '@/messages/zh.json';
import itMessages from '@/messages/it.json';

const messagesMap: Record<Locale, typeof enMessages> = {
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  de: deMessages,
  pt: ptMessages,
  zh: zhMessages,
  it: itMessages,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: readonly Locale[];
  localeNames: Record<Locale, string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  // Return default values if context is not available (during SSR/static generation)
  if (!context) {
    return {
      locale: defaultLocale,
      setLocale: () => {},
      locales,
      localeNames,
    };
  }
  return context;
}

// Detect browser language
function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  // Check localStorage first for user preference
  const savedLocale = localStorage.getItem('preferred-language') as Locale;
  if (savedLocale && locales.includes(savedLocale)) {
    return savedLocale;
  }
  
  // Get browser language
  const browserLang = navigator.language || (navigator as any).userLanguage || '';
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Check if we support this language
  if (locales.includes(langCode as Locale)) {
    return langCode as Locale;
  }
  
  // Check navigator.languages for alternatives
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      const code = lang.split('-')[0].toLowerCase();
      if (locales.includes(code as Locale)) {
        return code as Locale;
      }
    }
  }
  
  return defaultLocale;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const detectedLocale = detectBrowserLanguage();
    setLocaleState(detectedLocale);
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('preferred-language', newLocale);
    // Update HTML lang attribute
    document.documentElement.lang = newLocale;
  };

  const messages = messagesMap[locale] || messagesMap[defaultLocale];

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <NextIntlClientProvider locale={defaultLocale} messages={messagesMap[defaultLocale]}>
        {children}
      </NextIntlClientProvider>
    );
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, locales, localeNames }}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}
