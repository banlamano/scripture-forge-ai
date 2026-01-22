// Localized Devotionals
import type { LocalizedContent } from './devotionals-localized-types';
import { deDevotionals } from './devotionals/de';
import { esDevotionals } from './devotionals/es';
import { frDevotionals } from './devotionals/fr';
import { itDevotionals } from './devotionals/it';
import { ptDevotionals } from './devotionals/pt';
import { zhDevotionals } from './devotionals/zh';

// Map of locale codes to their devotional data
const localizedDevotionals: Record<string, Record<number, LocalizedContent>> = {
  de: deDevotionals,
  es: esDevotionals,
  fr: frDevotionals,
  it: itDevotionals,
  pt: ptDevotionals,
  zh: zhDevotionals,
};

// Returns localized devotional content for the given ID and locale
// Returns null for English (en) to use the full English content from devotionals-data.ts
export function getLocalizedDevotional(id: number, locale: string): LocalizedContent | null {
  // For English, return null to use the original English content
  if (locale === 'en') {
    return null;
  }
  
  // Get the devotionals for the requested locale
  const devotionals = localizedDevotionals[locale];
  
  if (!devotionals) {
    return null;
  }
  
  // Return the specific devotional if it exists
  return devotionals[id] || null;
}
