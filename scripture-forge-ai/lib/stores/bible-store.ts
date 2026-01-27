/**
 * Zustand store for Bible reader state
 * Enhanced with locale-aware translation management
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Default translations for each supported locale
export const DEFAULT_TRANSLATIONS_BY_LOCALE: Record<string, string> = {
  en: "06125adad2d5898a-01", // ASV
  es: "bolls:RV1960",        // Reina Valera 1960
  de: "bolls:LUT",           // Luther 1912
  fr: "bolls:FRLSG",         // Louis Segond 1910
  pt: "bolls:ARA",           // Almeida Revista e Atualizada
  zh: "bolls:CUNPS",         // Chinese Union (Simplified)
  it: "bolls:NR06",          // Nuova Riveduta 2006
};

interface BibleState {
  // Navigation
  selectedBook: string;
  selectedChapter: number;
  selectedTranslation: string;
  
  // Locale-aware translation preferences
  currentLocale: string;
  translationsByLocale: Record<string, string>; // locale -> translationId
  
  // UI
  fontSize: number;
  showVerseNumbers: boolean;
  
  // User content
  selectedVerses: number[];
  bookmarks: string[];
  highlights: Record<string, string>; // verseId -> color
  
  // Actions
  setBook: (book: string) => void;
  setChapter: (chapter: number) => void;
  setTranslation: (translation: string) => void;
  setFontSize: (size: number) => void;
  toggleVerseNumbers: () => void;
  selectVerse: (verse: number) => void;
  deselectVerse: (verse: number) => void;
  clearSelectedVerses: () => void;
  addBookmark: (reference: string) => void;
  removeBookmark: (reference: string) => void;
  setHighlight: (verseId: string, color: string) => void;
  removeHighlight: (verseId: string) => void;
  
  // Locale-aware actions
  setLocale: (locale: string) => void;
  setTranslationForLocale: (locale: string, translationId: string) => void;
  getTranslationForLocale: (locale: string) => string;
}

export const useBibleStore = create<BibleState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedBook: "John",
      selectedChapter: 1,
      selectedTranslation: DEFAULT_TRANSLATIONS_BY_LOCALE["en"],
      currentLocale: "en",
      translationsByLocale: { ...DEFAULT_TRANSLATIONS_BY_LOCALE },
      fontSize: 18,
      showVerseNumbers: true,
      selectedVerses: [],
      bookmarks: [],
      highlights: {},

      // Actions
      setBook: (book) => set({ selectedBook: book, selectedChapter: 1 }),
      setChapter: (chapter) => set({ selectedChapter: chapter, selectedVerses: [] }),
      setTranslation: (translation) => {
        const { currentLocale } = get();
        set((state) => ({ 
          selectedTranslation: translation,
          translationsByLocale: {
            ...state.translationsByLocale,
            [currentLocale]: translation
          }
        }));
      },
      setFontSize: (size) => set({ fontSize: Math.min(32, Math.max(12, size)) }),
      toggleVerseNumbers: () => set((state) => ({ showVerseNumbers: !state.showVerseNumbers })),
      
      selectVerse: (verse) =>
        set((state) => ({
          selectedVerses: state.selectedVerses.includes(verse)
            ? state.selectedVerses
            : [...state.selectedVerses, verse].sort((a, b) => a - b),
        })),
      
      deselectVerse: (verse) =>
        set((state) => ({
          selectedVerses: state.selectedVerses.filter((v) => v !== verse),
        })),
      
      clearSelectedVerses: () => set({ selectedVerses: [] }),
      
      addBookmark: (reference) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(reference)
            ? state.bookmarks
            : [...state.bookmarks, reference],
        })),
      
      removeBookmark: (reference) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b !== reference),
        })),
      
      setHighlight: (verseId, color) =>
        set((state) => ({
          highlights: { ...state.highlights, [verseId]: color },
        })),
      
      removeHighlight: (verseId) =>
        set((state) => {
          const { [verseId]: _, ...rest } = state.highlights;
          return { highlights: rest };
        }),

      // Locale-aware actions
      setLocale: (locale) => {
        const { translationsByLocale } = get();
        const translation = translationsByLocale[locale] || DEFAULT_TRANSLATIONS_BY_LOCALE[locale] || DEFAULT_TRANSLATIONS_BY_LOCALE["en"];
        set({ 
          currentLocale: locale,
          selectedTranslation: translation
        });
      },
      
      setTranslationForLocale: (locale, translationId) => {
        set((state) => ({
          translationsByLocale: {
            ...state.translationsByLocale,
            [locale]: translationId
          },
          // If this is the current locale, also update the active translation
          ...(state.currentLocale === locale ? { selectedTranslation: translationId } : {})
        }));
      },
      
      getTranslationForLocale: (locale) => {
        const { translationsByLocale } = get();
        return translationsByLocale[locale] || DEFAULT_TRANSLATIONS_BY_LOCALE[locale] || DEFAULT_TRANSLATIONS_BY_LOCALE["en"];
      },
    }),
    {
      name: "scripture-forge-bible",
      partialize: (state) => ({
        selectedBook: state.selectedBook,
        selectedChapter: state.selectedChapter,
        selectedTranslation: state.selectedTranslation,
        currentLocale: state.currentLocale,
        translationsByLocale: state.translationsByLocale,
        fontSize: state.fontSize,
        showVerseNumbers: state.showVerseNumbers,
        bookmarks: state.bookmarks,
        highlights: state.highlights,
      }),
    }
  )
);
