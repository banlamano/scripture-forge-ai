"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
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
  // Use the first available translation for the current language as default
  const [selectedBibleId, setSelectedBibleId] = useState<string>(() => {
    const translations = BIBLE_TRANSLATIONS[locale] || BIBLE_TRANSLATIONS["en"];
    return translations[0]?.id || "685d1470fe4d5c3b-01";
  });
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [selectedWord, setSelectedWord] = useState<{ word: string; verseNumber: number } | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontSize, setFontSize] = useState(18);
  const [chapterData, setChapterData] = useState<ChapterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle sidebar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden"
            >
              <BookOpen className="w-5 h-5" />
            </Button>

            {/* Book/Chapter selector */}
            <div className="flex items-center gap-2">
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t("selectBook")}>
                    {t(`books.${selectedBook}`)}
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
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 font-medium min-w-[60px] text-center">
                  {t("chapter")} {selectedChapter}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateChapter("next")}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Translation selector - shows translations for current language */}
            <Select value={selectedBibleId} onValueChange={setSelectedBibleId}>
              <SelectTrigger className="w-[120px]">
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

            {/* Search */}
            <div className="flex-1 max-w-xs hidden lg:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={tCommon("search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 ml-auto">
              <Button variant="ghost" size="icon" onClick={speakChapter}>
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Scripture content */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-6 py-8">
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
                    
                    // Helper to render words as clickable spans
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
                            className={`cursor-pointer hover:bg-primary/30 rounded transition-colors ${
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
                          className={`cursor-pointer transition-colors rounded p-2 ${
                            isSelected
                              ? "bg-primary/20 text-primary"
                              : "hover:bg-muted"
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
                        className={`inline cursor-pointer transition-colors rounded px-0.5 ${
                          isSelected
                            ? "bg-primary/20 text-primary"
                            : "hover:bg-muted"
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
