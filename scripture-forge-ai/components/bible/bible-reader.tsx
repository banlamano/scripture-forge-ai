"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Bookmark,
  Highlighter,
  Volume2,
  Settings,
  Share2,
  StickyNote,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { BIBLE_BOOKS, isSingleChapterBook } from "@/lib/utils";
import { BIBLE_TRANSLATIONS } from "@/lib/api-bible";
import { BibleSidebar } from "./bible-sidebar";
import { VerseActions } from "./verse-actions";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/components/providers/language-provider";

interface ChapterData {
  book: string;
  chapter: number;
  translation: string;
  translationName?: string;
  verses: { number: number; text: string; originalText?: string }[];
  isAiTranslated?: boolean;
  isNativeTranslation?: boolean;
  language?: string;
}

export function BibleReader() {
  const t = useTranslations("bible");
  const tCommon = useTranslations("common");
  const { locale } = useLanguage();
  const searchParams = useSearchParams();
  
  // Get available translations for the current language
  const availableTranslations = useMemo(() => {
    return BIBLE_TRANSLATIONS[locale] || BIBLE_TRANSLATIONS["en"];
  }, [locale]);
  
  // Initialize book and chapter from URL parameters, with defaults
  const [selectedBook, setSelectedBook] = useState(() => {
    const bookFromUrl = searchParams.get("book");
    // Validate that the book exists in BIBLE_BOOKS
    if (bookFromUrl && (BIBLE_BOOKS as readonly string[]).includes(bookFromUrl)) {
      return bookFromUrl;
    }
    return "John";
  });
  
  const [selectedChapter, setSelectedChapter] = useState(() => {
    const chapterFromUrl = searchParams.get("chapter");
    if (chapterFromUrl) {
      const chapter = parseInt(chapterFromUrl, 10);
      if (!isNaN(chapter) && chapter >= 1) {
        return chapter;
      }
    }
    return 3;
  });
  // Local storage key for default translation preference (must match profile page)
  const TRANSLATION_PREFERENCE_KEY = "scripture-forge-default-translation";
  
  // Use saved preference or first available translation for the current language as default
  const [selectedBibleId, setSelectedBibleId] = useState<string>(() => {
    // Check for saved preference in localStorage (client-side only)
    if (typeof window !== "undefined") {
      const savedTranslation = localStorage.getItem(TRANSLATION_PREFERENCE_KEY);
      if (savedTranslation) {
        const translations = BIBLE_TRANSLATIONS[locale] || BIBLE_TRANSLATIONS["en"];
        const isValid = translations.some(t => t.id === savedTranslation);
        if (isValid) {
          return savedTranslation;
        }
      }
    }
    // Default to first translation for current language
    const translations = BIBLE_TRANSLATIONS[locale] || BIBLE_TRANSLATIONS["en"];
    return translations[0]?.id || "685d1470fe4d5c3b-01";
  });
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [selectedWord, setSelectedWord] = useState<{ word: string; verseNumber: number } | null>(null);
  const [showSidebar, setShowSidebar] = useState(false); // Default closed on mobile
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    book: string;
    chapter: number;
    verse: number;
    text: string;
    testament?: 'OT' | 'NT';
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchMode, setSearchMode] = useState(false); // When true, show search results in main content
  const [searchFilter, setSearchFilter] = useState<'all' | 'ot' | 'nt' | string>('all');
  const [searchCounts, setSearchCounts] = useState<{
    total: number;
    ot: number;
    nt: number;
    books: Record<string, number>;
  }>({ total: 0, ot: 0, nt: 0, books: {} });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState(18);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Swipe gesture state for mobile chapter navigation
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // Update selected translation when locale changes
  useEffect(() => {
    const translations = BIBLE_TRANSLATIONS[locale] || BIBLE_TRANSLATIONS["en"];
    if (translations.length > 0) {
      // Check if current selection is valid for this language
      const isValidForLanguage = translations.some(t => t.id === selectedBibleId);
      if (!isValidForLanguage) {
        setSelectedBibleId(translations[0].id);
      }
    }
  }, [locale, selectedBibleId]);

  // Update book and chapter when URL parameters change (e.g., from reading plans navigation)
  useEffect(() => {
    const bookFromUrl = searchParams.get("book");
    const chapterFromUrl = searchParams.get("chapter");
    
    if (bookFromUrl && (BIBLE_BOOKS as readonly string[]).includes(bookFromUrl)) {
      setSelectedBook(bookFromUrl);
    }
    
    if (chapterFromUrl) {
      const chapter = parseInt(chapterFromUrl, 10);
      if (!isNaN(chapter) && chapter >= 1) {
        setSelectedChapter(chapter);
      }
    }
  }, [searchParams]);

  // Fetch chapter data when book, chapter, translation, or language changes
  useEffect(() => {
    const fetchChapterData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Always use bibleId for API.Bible - pass both lang and bibleId
        const response = await fetch(
          `/api/bible/chapter/${encodeURIComponent(selectedBook)}/${selectedChapter}?lang=${locale}&bibleId=${selectedBibleId}`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch chapter");
        }
        
        const data = await response.json();
        
        // Find translation info for display
        const currentTranslation = availableTranslations.find(t => t.id === selectedBibleId);
        
        // Transform the data to match our expected format
        const transformedData: ChapterData = {
          book: data.book || selectedBook,
          chapter: data.chapter || selectedChapter,
          translation: currentTranslation?.abbreviation || data.translation || selectedBibleId,
          translationName: currentTranslation?.name || data.translationName,
          verses: data.verses?.map((v: { verse: number; text: string }) => ({
            number: v.verse,
            text: v.text,
          })) || [],
          isNativeTranslation: data.isNativeTranslation || locale !== "en",
          language: data.language || locale,
        };
        
        setChapterData(transformedData);
      } catch (err) {
        console.error("Error fetching chapter:", err);
        setError("Failed to load chapter. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapterData();
  }, [selectedBook, selectedChapter, selectedBibleId, locale, availableTranslations]);

  const toggleVerseSelection = useCallback((verseNumber: number) => {
    setSelectedWord(null); // Clear word selection when selecting verse
    setSelectedVerses((prev) =>
      prev.includes(verseNumber)
        ? prev.filter((v) => v !== verseNumber)
        : [...prev, verseNumber]
    );
  }, []);

  const handleWordClick = useCallback((word: string, verseNumber: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent verse selection
    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[.,;:!?'"()[\]{}]/g, '').trim();
    if (cleanWord) {
      setSelectedVerses([]); // Clear verse selection when selecting word
      setSelectedWord({ word: cleanWord, verseNumber });
    }
  }, []);

  const clearWordSelection = useCallback(() => {
    setSelectedWord(null);
  }, []);

  const speakChapter = () => {
    if ("speechSynthesis" in window && chapterData) {
      const text = chapterData.verses.map((v) => v.text).join(" ");
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const navigateChapter = (direction: "prev" | "next") => {
    setSelectedChapter((prev) =>
      direction === "next" ? prev + 1 : Math.max(1, prev - 1)
    );
    setSelectedVerses([]);
    setSelectedWord(null);
  };

  // Swipe gesture handlers for mobile chapter navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
    setSwipeDirection(null);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = touchStartX.current - currentX;
    const diffY = Math.abs(touchStartY.current - currentY);
    
    // Only track horizontal swipes (ignore vertical scrolling)
    if (diffY > 50) {
      touchStartX.current = null;
      setSwipeDirection(null);
      return;
    }
    
    touchEndX.current = currentX;
    
    // Show visual feedback for swipe direction
    if (Math.abs(diffX) > 30) {
      setSwipeDirection(diffX > 0 ? 'left' : 'right');
    } else {
      setSwipeDirection(null);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) {
      setSwipeDirection(null);
      return;
    }
    
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 80; // Minimum distance for a valid swipe
    
    if (Math.abs(diffX) >= minSwipeDistance) {
      if (diffX > 0) {
        // Swiped left -> next chapter
        navigateChapter("next");
      } else {
        // Swiped right -> previous chapter
        navigateChapter("prev");
      }
    }
    
    // Reset touch state
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    setSwipeDirection(null);
  }, []);

  // Smart Search functionality
  const handleSearch = useCallback(async (filter: string = 'all') => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchMode(false);
      return;
    }

    setIsSearching(true);
    setSearchMode(true);
    setSearchFilter(filter);

    try {
      const response = await fetch(
        `/api/bible/search?q=${encodeURIComponent(searchQuery)}&filter=${filter}&lang=${locale}`
      );
      
      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults(data.results || []);
      setSearchCounts({
        total: data.totalCount || 0,
        ot: data.otCount || 0,
        nt: data.ntCount || 0,
        books: data.bookCounts || {},
      });
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
      setSearchCounts({ total: 0, ot: 0, nt: 0, books: {} });
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Handle search input key press
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch('all');
    } else if (e.key === "Escape") {
      clearSearch();
    }
  };

  // Clear search and return to normal view
  const clearSearch = () => {
    setSearchMode(false);
    setSearchResults([]);
    setSearchQuery("");
    setSearchFilter('all');
    setSearchCounts({ total: 0, ot: 0, nt: 0, books: {} });
  };

  // Change search filter
  const changeSearchFilter = (filter: 'all' | 'ot' | 'nt' | string) => {
    handleSearch(filter);
  };

  // Navigate to search result
  const goToSearchResult = (book: string, chapter: number, verse: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setSelectedVerses([verse]);
    clearSearch();
  };

  // Highlight search term in text
  const highlightSearchTerm = (text: string, term: string) => {
    if (!term.trim()) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      {showSidebar && (
        <BibleSidebar
          selectedBook={selectedBook}
          selectedChapter={selectedChapter}
          onSelectBook={setSelectedBook}
          onSelectChapter={setSelectedChapter}
          onClose={() => setShowSidebar(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3 sm:px-4 py-2 sm:py-3">
          {/* Mobile Search Bar - shown when search is active */}
          {showMobileSearch && (
            <div className="flex items-center gap-2 mb-3 lg:hidden">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder={t("searchPlaceholder") || "Search the Bible..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9 pr-10 h-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
              {searchQuery ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSearch('all')}
                  className="shrink-0 h-10"
                >
                  <Search className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileSearch(false)}
                  className="shrink-0 h-10"
                >
                  {t("cancel") || "Cancel"}
                </Button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Toggle sidebar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="h-9 w-9 shrink-0"
            >
              <BookOpen className="w-5 h-5" />
            </Button>

            {/* Book/Chapter selector - responsive */}
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger className="w-[100px] sm:w-[140px] md:w-[160px] h-9">
                  <SelectValue placeholder={t("selectBook")}>
                    <span className="truncate">{t(`books.${selectedBook}`)}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BIBLE_BOOKS.map((book) => (
                    <SelectItem key={book} value={book}>
                      {t(`books.${book}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateChapter("prev")}
                  className="h-9 w-9 hidden sm:flex"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 sm:px-3 font-medium min-w-[50px] sm:min-w-[60px] text-center text-sm sm:text-base">
                  {selectedChapter}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateChapter("next")}
                  className="h-9 w-9 hidden sm:flex"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Translation selector - responsive */}
              <Select value={selectedBibleId} onValueChange={setSelectedBibleId}>
                <SelectTrigger className="w-[70px] sm:w-[100px] md:w-[120px] h-9">
                  <SelectValue placeholder={t("selectTranslation")} />
                </SelectTrigger>
                <SelectContent>
                  {availableTranslations.map((trans) => (
                    <SelectItem key={trans.id} value={trans.id}>
                      {trans.abbreviation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Search */}
            <div className="flex-1 max-w-sm hidden lg:block">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder={t("searchPlaceholder") || "Search the Bible..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-9 pr-10"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {!isSearching && searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => handleSearch('all')}
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                    </Button>
                  )}
                </div>
                {searchMode && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                    className="shrink-0"
                  >
                    {t("clearSearch") || "Clear"}
                  </Button>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-auto shrink-0">
              {/* Mobile search button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="h-9 w-9 lg:hidden"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={speakChapter} className="h-9 w-9 hidden sm:flex">
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hidden md:flex">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scripture content */}
        <ScrollArea className="flex-1 relative">
          {/* Swipe indicators for mobile */}
          <AnimatePresence>
            {swipeDirection === 'left' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="fixed right-4 top-1/2 -translate-y-1/2 z-40 md:hidden pointer-events-none"
              >
                <div className="bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </motion.div>
            )}
            {swipeDirection === 'right' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="fixed left-4 top-1/2 -translate-y-1/2 z-40 md:hidden pointer-events-none"
              >
                <div className="bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg">
                  <ChevronLeft className="w-6 h-6" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div 
            className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Search Results Mode */}
            {searchMode && (
              <>
                {/* Search header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      {t("searchResults") || "Search Results"}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={clearSearch}>
                      ← {t("backToReading") || "Back to Reading"}
                    </Button>
                  </div>
                  {!isSearching && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchCounts.total} {t("resultsFound") || "results found"} for &quot;{searchQuery}&quot;
                    </p>
                  )}
                  
                  {/* Filter Tabs */}
                  {!isSearching && searchCounts.total > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {/* All */}
                      <Button
                        variant={searchFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => changeSearchFilter('all')}
                        className="rounded-full"
                      >
                        {t("filterAll") || "All"} ({searchCounts.total})
                      </Button>
                      {/* Old Testament */}
                      {searchCounts.ot > 0 && (
                        <Button
                          variant={searchFilter === 'ot' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => changeSearchFilter('ot')}
                          className="rounded-full"
                        >
                          {t("oldTestament") || "Old Testament"} ({searchCounts.ot})
                        </Button>
                      )}
                      {/* New Testament */}
                      {searchCounts.nt > 0 && (
                        <Button
                          variant={searchFilter === 'nt' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => changeSearchFilter('nt')}
                          className="rounded-full"
                        >
                          {t("newTestament") || "New Testament"} ({searchCounts.nt})
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Book Filter Dropdown */}
                  {!isSearching && Object.keys(searchCounts.books).length > 0 && (
                    <div className="mb-4">
                      <select
                        value={searchFilter !== 'all' && searchFilter !== 'ot' && searchFilter !== 'nt' ? searchFilter : ''}
                        onChange={(e) => e.target.value && changeSearchFilter(e.target.value)}
                        className="w-full max-w-xs px-3 py-2 border rounded-lg bg-background text-sm"
                      >
                        <option value="">{t("filterByBook") || "Filter by Book..."}</option>
                        {Object.entries(searchCounts.books)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([book, count]) => (
                            <option key={book} value={book}>
                              {t(`books.${book}`) || book} ({count})
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Loading search */}
                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">{t("searching") || "Searching..."}</p>
                  </div>
                )}

                {/* Search results list */}
                {!isSearching && searchResults.length > 0 && (
                  <div className="space-y-3">
                    {searchResults.map((result, index) => (
                      <motion.div
                        key={`${result.book}-${result.chapter}-${result.verse}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card
                          className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-primary"
                          onClick={() => goToSearchResult(result.book, result.chapter, result.verse)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-base leading-relaxed">
                                  {highlightSearchTerm(result.text, searchQuery)}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  {t(`books.${result.book}`) || result.book} {result.chapter}:{result.verse}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* No results */}
                {!isSearching && searchResults.length === 0 && searchQuery.trim() && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Search className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">{t("noResults") || "No results found"}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("tryDifferentSearch") || "Try a different search term"}
                    </p>
                    <Button variant="outline" onClick={clearSearch}>
                      {t("backToReading") || "Back to Reading"}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Normal Bible Reading Mode */}
            {!searchMode && (
              <>
                {/* Loading state */}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">{tCommon("loading")}</p>
                  </div>
                )}

                {/* Error state */}
                {error && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-destructive mb-4">{t("failedToLoad")}</p>
                    <Button onClick={() => window.location.reload()}>{t("tryAgain")}</Button>
                  </div>
                )}

                {/* Chapter content */}
                {!isLoading && !error && chapterData && (
              <>
                {/* Chapter header */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-serif font-bold mb-2">
                    {t(`books.${selectedBook}`)} {chapterData.chapter}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {chapterData.translationName || availableTranslations.find((t) => t.id === selectedBibleId)?.name || chapterData.translation}
                  </p>
                  {/* Native Translation indicator */}
                  {chapterData.isNativeTranslation && locale !== "en" && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
                      <BookOpen className="w-3 h-3" />
                      {t("nativeTranslation")}
                    </div>
                  )}
                </div>

                {/* Verses */}
                <div 
                  className={`scripture-text ${isSingleChapterBook(selectedBook) ? 'space-y-4' : 'space-y-1'}`} 
                  style={{ fontSize: `${fontSize}px` }}
                >
                  {chapterData.verses.map((verse) => {
                    const isSelected = selectedVerses.includes(verse.number);
                    const isSingleChapter = isSingleChapterBook(selectedBook);
                    
                    // Helper to render words as clickable/tappable spans
                    const renderWordsWithClick = (text: string, verseNum: number) => {
                      const words = text.split(/(\s+)/); // Split but keep spaces
                      return words.map((word, idx) => {
                        if (word.trim() === '') return word; // Return spaces as-is
                        const cleanWord = word.replace(/[.,;:!?'"()[\]{}]/g, '').trim();
                        const isWordSelected = selectedWord?.word === cleanWord && selectedWord?.verseNumber === verseNum;
                        return (
                          <span
                            key={idx}
                            onClick={(e) => handleWordClick(word, verseNum, e)}
                            onTouchEnd={(e) => {
                              // Prevent ghost click on mobile
                              e.preventDefault();
                              handleWordClick(word, verseNum, e as unknown as React.MouseEvent);
                            }}
                            className={`cursor-pointer hover:bg-primary/30 active:bg-primary/40 rounded transition-colors select-none touch-manipulation ${
                              isWordSelected ? 'bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white font-semibold' : ''
                            }`}
                          >
                            {word}
                          </span>
                        );
                      });
                    };

                    // For single-chapter books, display each verse as a paragraph
                    if (isSingleChapter) {
                      return (
                        <motion.p
                          key={verse.number}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: verse.number * 0.02 }}
                          onClick={() => toggleVerseSelection(verse.number)}
                          className={`cursor-pointer transition-colors rounded p-2 sm:p-3 touch-manipulation ${
                            isSelected
                              ? "bg-primary/20 text-primary"
                              : "hover:bg-muted active:bg-muted/80"
                          }`}
                        >
                          <sup className="verse-number font-bold text-primary mr-2">{verse.number}</sup>
                          {renderWordsWithClick(verse.text, verse.number)}
                        </motion.p>
                      );
                    }
                    
                    // For multi-chapter books, display inline
                    return (
                      <motion.span
                        key={verse.number}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: verse.number * 0.02 }}
                        onClick={() => toggleVerseSelection(verse.number)}
                        className={`inline cursor-pointer transition-colors rounded px-0.5 py-1 touch-manipulation ${
                          isSelected
                            ? "bg-primary/20 text-primary"
                            : "hover:bg-muted active:bg-muted/80"
                        }`}
                      >
                        <sup className="verse-number">{verse.number}</sup>
                        {renderWordsWithClick(verse.text, verse.number)}{" "}
                      </motion.span>
                    );
                  })}
                </div>

                {/* Selected verse actions */}
                {selectedVerses.length > 0 && (
                  <VerseActions
                    selectedVerses={selectedVerses}
                    book={chapterData.book}
                    chapter={chapterData.chapter}
                    onClear={() => setSelectedVerses([])}
                  />
                )}

                {/* Selected word actions */}
                {selectedWord && (
                  <VerseActions
                    selectedVerses={[selectedWord.verseNumber]}
                    book={chapterData.book}
                    chapter={chapterData.chapter}
                    onClear={clearWordSelection}
                    selectedWord={selectedWord.word}
                  />
                )}
              </>
            )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Bottom navigation for mobile */}
        <div className="border-t p-4 flex justify-between items-center md:hidden">
          <Button variant="outline" onClick={() => navigateChapter("prev")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
          </Button>
          <span className="font-medium">
            {t(`books.${selectedBook}`)} {selectedChapter}
          </span>
          <Button variant="outline" onClick={() => navigateChapter("next")}>
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
