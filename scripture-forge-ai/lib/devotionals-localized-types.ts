// Types for localized devotional content

export interface LocalizedContent {
  theme: string;
  verseText: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  furtherReading: string[];
}

export type LocaleCode = 'en' | 'de' | 'es' | 'fr' | 'it' | 'pt' | 'zh';
