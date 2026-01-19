/**
 * Zustand store for Bible reader state
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BibleState {
  // Navigation
  selectedBook: string;
  selectedChapter: number;
  selectedTranslation: string;
  
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
}

export const useBibleStore = create<BibleState>()(
  persist(
    (set) => ({
      // Initial state
      selectedBook: "John",
      selectedChapter: 1,
      selectedTranslation: "esv",
      fontSize: 18,
      showVerseNumbers: true,
      selectedVerses: [],
      bookmarks: [],
      highlights: {},

      // Actions
      setBook: (book) => set({ selectedBook: book, selectedChapter: 1 }),
      setChapter: (chapter) => set({ selectedChapter: chapter, selectedVerses: [] }),
      setTranslation: (translation) => set({ selectedTranslation: translation }),
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
    }),
    {
      name: "scripture-forge-bible",
      partialize: (state) => ({
        selectedBook: state.selectedBook,
        selectedChapter: state.selectedChapter,
        selectedTranslation: state.selectedTranslation,
        fontSize: state.fontSize,
        showVerseNumbers: state.showVerseNumbers,
        bookmarks: state.bookmarks,
        highlights: state.highlights,
      }),
    }
  )
);
