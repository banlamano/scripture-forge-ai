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
  BookmarkCheck,
  Highlighter,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square,
  Settings,
  Share2,
  StickyNote,
  Sparkles,
  Loader2,
  X,
  Type,
  Sun,
  Moon,
  Monitor,
  Check,
  Copy,
  Link2,
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
import { useTheme } from "next-themes";
import { useAudio } from "@/lib/hooks/use-audio";
import { toast } from "sonner";

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
  
  // Pinch-to-zoom state for font size adjustment
  const initialPinchDistance = useRef<number | null>(null);
  const initialFontSize = useRef<number>(18);
  const [isPinching, setIsPinching] = useState(false);
  const [fontSizeIndicator, setFontSizeIndicator] = useState<number | null>(null);
  
  // Font size constraints
  const MIN_FONT_SIZE = 12;
  const MAX_FONT_SIZE = 32;

  // Audio playback
  const audio = useAudio({ rate: 0.9 });
  
  // Theme
  const { theme, setTheme } = useTheme();
  
  // UI state for modals/panels
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Bookmarks state (persisted to localStorage)
  const BOOKMARKS_KEY = "scripture-forge-bookmarks";
  const [bookmarks, setBookmarks] = useState<Array<{ book: string; chapter: number; timestamp: number }>>([]);
  const [showBookmarksPanel, setShowBookmarksPanel] = useState(false);
  
  // Check if current chapter is bookmarked
  const isCurrentChapterBookmarked = useMemo(() => {
    return bookmarks.some(b => b.book === selectedBook && b.chapter === selectedChapter);
  }, [bookmarks, selectedBook, selectedChapter]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(BOOKMARKS_KEY);
      if (saved) {
        try {
          setBookmarks(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load bookmarks:", e);
        }
      }
    }
  }, []);

  // Save bookmarks to localStorage
  const saveBookmarks = useCallback((newBookmarks: Array<{ book: string; chapter: number; timestamp: number }>) => {
    setBookmarks(newBookmarks);
    if (typeof window !== "undefined") {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    }
  }, []);
  
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

  // Clear all selections when tapping on empty area
  const clearAllSelections = useCallback(() => {
    setSelectedWord(null);
    setSelectedVerses([]);
  }, []);

  // Audio control functions
  const handlePlayAudio = useCallback(() => {
    if (chapterData && !audio.isPlaying) {
      const text = chapterData.verses.map((v) => `Verse ${v.number}. ${v.text}`).join(" ");
      audio.speak(text);
      toast.success(t("audioStarted") || "Playing audio...");
    }
  }, [chapterData, audio, t]);

  const handleStopAudio = useCallback(() => {
    audio.stop();
    toast.info(t("audioStopped") || "Audio stopped");
  }, [audio, t]);

  const handleToggleAudio = useCallback(() => {
    if (audio.isPlaying) {
      if (audio.isPaused) {
        audio.resume();
      } else {
        audio.pause();
      }
    } else {
      handlePlayAudio();
    }
  }, [audio, handlePlayAudio]);

  // Bookmark functions
  const toggleBookmark = useCallback(() => {
    if (isCurrentChapterBookmarked) {
      // Remove bookmark
      const newBookmarks = bookmarks.filter(
        b => !(b.book === selectedBook && b.chapter === selectedChapter)
      );
      saveBookmarks(newBookmarks);
      toast.info(t("bookmarkRemoved") || "Bookmark removed");
    } else {
      // Add bookmark
      const newBookmarks = [
        ...bookmarks,
        { book: selectedBook, chapter: selectedChapter, timestamp: Date.now() }
      ];
      saveBookmarks(newBookmarks);
      toast.success(t("bookmarkAdded") || "Bookmark added");
    }
  }, [isCurrentChapterBookmarked, bookmarks, selectedBook, selectedChapter, saveBookmarks, t]);

  const goToBookmark = useCallback((book: string, chapter: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setShowBookmarksPanel(false);
    setSelectedVerses([]);
    setSelectedWord(null);
  }, []);

  const removeBookmark = useCallback((book: string, chapter: number) => {
    const newBookmarks = bookmarks.filter(
      b => !(b.book === book && b.chapter === chapter)
    );
    saveBookmarks(newBookmarks);
    toast.info(t("bookmarkRemoved") || "Bookmark removed");
  }, [bookmarks, saveBookmarks, t]);

  // Share functions
  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/bible?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`;
    const shareTitle = `${t(`books.${selectedBook}`)} ${selectedChapter}`;
    const shareText = chapterData 
      ? `Read ${shareTitle} - Scripture Forge AI`
      : shareTitle;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed - fall back to copy
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(shareUrl);
        }
      }
    } else {
      setShowShareModal(true);
    }
  }, [selectedBook, selectedChapter, chapterData, t]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("linkCopied") || "Link copied to clipboard");
      setShowShareModal(false);
    } catch {
      toast.error(t("copyFailed") || "Failed to copy");
    }
  }, [t]);

  // Settings functions
  const handleFontSizeChange = useCallback((newSize: number) => {
    const clampedSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
    setFontSize(clampedSize);
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("scripture-forge-font-size", String(clampedSize));
    }
  }, []);

  // Load saved font size on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFontSize = localStorage.getItem("scripture-forge-font-size");
      if (savedFontSize) {
        const size = parseInt(savedFontSize, 10);
        if (!isNaN(size)) {
          setFontSize(Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, size)));
        }
      }
    }
  }, []);

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
    // Handle pinch end
    if (isPinching) {
      setIsPinching(false);
      initialPinchDistance.current = null;
      // Hide font size indicator after a short delay
      setTimeout(() => setFontSizeIndicator(null), 800);
      return;
    }
    
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
  }, [isPinching]);

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Pinch gesture handlers for font size adjustment
  const handlePinchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialPinchDistance.current = getTouchDistance(e.touches);
      initialFontSize.current = fontSize;
      setIsPinching(true);
      // Cancel any swipe gesture
      touchStartX.current = null;
      setSwipeDirection(null);
    }
  }, [fontSize, getTouchDistance]);

  const handlePinchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance.current !== null) {
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance.current;
      
      // Calculate new font size based on pinch scale
      let newFontSize = Math.round(initialFontSize.current * scale);
      
      // Clamp font size to min/max bounds
      newFontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newFontSize));
      
      setFontSize(newFontSize);
      setFontSizeIndicator(newFontSize);
    }
  }, [getTouchDistance]);

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
              
              {/* Audio controls */}
              {audio.isPlaying ? (
                <div className="flex items-center gap-0.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleToggleAudio}
                    className="h-9 w-9 text-primary"
                  >
                    {audio.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleStopAudio}
                    className="h-9 w-9 text-destructive"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePlayAudio}
                  className="h-9 w-9"
                  disabled={!chapterData || isLoading}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
              
              {/* Bookmark button - single tap to bookmark, shows badge if has bookmarks */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleBookmark}
                onDoubleClick={() => setShowBookmarksPanel(true)}
                className={`h-9 w-9 hidden sm:flex relative ${isCurrentChapterBookmarked ? 'text-primary' : ''}`}
                title={isCurrentChapterBookmarked ? (t("removeBookmark") || "Remove bookmark") : (t("addBookmark") || "Add bookmark")}
              >
                {isCurrentChapterBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {bookmarks.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBookmarksPanel(true);
                    }}
                  >
                    {bookmarks.length}
                  </span>
                )}
              </Button>
              
              {/* Share button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleShare}
                className="h-9 w-9 hidden md:flex"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              
              {/* Settings button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="h-9 w-9"
              >
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
            
            {/* Font size indicator for pinch-to-zoom */}
            {fontSizeIndicator !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
              >
                <div className="bg-black/80 text-white rounded-2xl px-6 py-4 shadow-2xl flex flex-col items-center gap-2">
                  <span className="text-3xl font-bold">{fontSizeIndicator}px</span>
                  <span className="text-xs text-white/70 uppercase tracking-wide">Font Size</span>
                  {/* Visual size preview bar */}
                  <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ 
                        width: `${((fontSizeIndicator - MIN_FONT_SIZE) / (MAX_FONT_SIZE - MIN_FONT_SIZE)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div 
            className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8"
            onTouchStart={(e) => {
              handleTouchStart(e);
              handlePinchStart(e);
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2) {
                handlePinchMove(e);
              } else if (!isPinching) {
                handleTouchMove(e);
              }
            }}
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
              <div 
                className="min-h-full"
                onClick={(e) => {
                  // Clear selections when tapping on background area
                  const target = e.target as HTMLElement;
                  // Don't clear if clicking on interactive elements
                  if (
                    target.closest('.verse-number') ||
                    target.closest('button') ||
                    target.closest('a') ||
                    target.closest('[role="button"]')
                  ) {
                    return;
                  }
                  // Check if click is on empty space (not on text content)
                  const isEmptySpace = 
                    target.tagName === 'DIV' && 
                    !target.classList.contains('scripture-text');
                  if (isEmptySpace && (selectedWord || selectedVerses.length > 0)) {
                    clearAllSelections();
                  }
                }}
              >
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
                  onClick={(e) => {
                    // Clear selections when clicking on empty area (not on a word or verse)
                    if (e.target === e.currentTarget) {
                      clearAllSelections();
                    }
                  }}
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
              </div>
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

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettingsPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowSettingsPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t("settings") || "Settings"}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowSettingsPanel(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-4 space-y-6">
                {/* Font Size */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    {t("fontSize") || "Font Size"}
                  </h3>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFontSizeChange(fontSize - 2)}
                      disabled={fontSize <= MIN_FONT_SIZE}
                    >
                      A-
                    </Button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-medium">{fontSize}px</span>
                      <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${((fontSize - MIN_FONT_SIZE) / (MAX_FONT_SIZE - MIN_FONT_SIZE)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFontSizeChange(fontSize + 2)}
                      disabled={fontSize >= MAX_FONT_SIZE}
                    >
                      A+
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {t("fontSizeHint") || "Tip: You can also pinch to zoom on mobile"}
                  </p>
                </div>

                {/* Theme */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    {t("theme") || "Theme"}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Sun className="w-5 h-5" />
                      <span className="text-xs">{t("light") || "Light"}</span>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Moon className="w-5 h-5" />
                      <span className="text-xs">{t("dark") || "Dark"}</span>
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <Monitor className="w-5 h-5" />
                      <span className="text-xs">{t("system") || "System"}</span>
                    </Button>
                  </div>
                </div>

                {/* Audio Speed - placeholder for future */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    {t("audioSettings") || "Audio"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("audioHint") || "Click the speaker icon in the toolbar to listen to the chapter being read aloud."}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bookmarks Panel */}
      <AnimatePresence>
        {showBookmarksPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowBookmarksPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-background border-l shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Bookmark className="w-5 h-5" />
                  {t("bookmarks") || "Bookmarks"}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowBookmarksPanel(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-4">
                {bookmarks.length === 0 ? (
                  <div className="text-center py-8">
                    <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t("noBookmarks") || "No bookmarks yet"}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("bookmarkHint") || "Click the bookmark icon to save your favorite chapters"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarks
                      .sort((a, b) => b.timestamp - a.timestamp)
                      .map((bookmark) => (
                        <div
                          key={`${bookmark.book}-${bookmark.chapter}`}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <button
                            onClick={() => goToBookmark(bookmark.book, bookmark.chapter)}
                            className="flex-1 text-left"
                          >
                            <span className="font-medium">
                              {t(`books.${bookmark.book}`)} {bookmark.chapter}
                            </span>
                            <span className="text-xs text-muted-foreground block mt-0.5">
                              {new Date(bookmark.timestamp).toLocaleDateString()}
                            </span>
                          </button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBookmark(bookmark.book, bookmark.chapter)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowShareModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-xl shadow-xl z-50 p-6 mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  {t("shareChapter") || "Share Chapter"}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setShowShareModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("shareDescription") || "Share this chapter with others"}
                  </p>
                  <p className="font-medium text-lg">
                    {t(`books.${selectedBook}`)} {selectedChapter}
                  </p>
                </div>

                {/* Share Options */}
                <div className="grid grid-cols-4 gap-3">
                  {/* WhatsApp */}
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/bible?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`;
                      const text = `${t(`books.${selectedBook}`)} ${selectedChapter} - Scripture Forge AI`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
                      setShowShareModal(false);
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <span className="text-xs">WhatsApp</span>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/bible?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                      setShowShareModal(false);
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <span className="text-xs">Facebook</span>
                  </button>

                  {/* Twitter/X */}
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/bible?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`;
                      const text = `${t(`books.${selectedBook}`)} ${selectedChapter} - Scripture Forge AI`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                      setShowShareModal(false);
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <span className="text-xs">X</span>
                  </button>

                  {/* Email */}
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/bible?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`;
                      const subject = `${t(`books.${selectedBook}`)} ${selectedChapter} - Scripture Forge AI`;
                      const body = `Check out this chapter:\n\n${t(`books.${selectedBook}`)} ${selectedChapter}\n\n${url}`;
                      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      setShowShareModal(false);
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs">Email</span>
                  </button>

                  {/* Telegram */}
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/bible?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`;
                      const text = `${t(`books.${selectedBook}`)} ${selectedChapter} - Scripture Forge AI`;
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                      setShowShareModal(false);
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <span className="text-xs">Telegram</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/bible?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`;
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                      setShowShareModal(false);
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <span className="text-xs">LinkedIn</span>
                  </button>

                  {/* Reddit */}
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/bible?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`;
                      const title = `${t(`books.${selectedBook}`)} ${selectedChapter} - Scripture Forge AI`;
                      window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
                      setShowShareModal(false);
                    }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                      </svg>
                    </div>
                    <span className="text-xs">Reddit</span>
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => copyToClipboard(
                      `${window.location.origin}/bible?book=${encodeURIComponent(selectedBook)}&chapter=${selectedChapter}`
                    )}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Copy className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xs">{t("copyLink") || "Copy"}</span>
                  </button>
                </div>

                {/* Link preview */}
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <code className="flex-1 text-xs truncate">
                    {typeof window !== 'undefined' 
                      ? `${window.location.origin}/bible?book=${selectedBook}&chapter=${selectedChapter}`
                      : `/bible?book=${selectedBook}&chapter=${selectedChapter}`
                    }
                  </code>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
