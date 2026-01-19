"use client";

import { useState } from "react";
import { X, Search, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BIBLE_BOOKS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BibleSidebarProps {
  selectedBook: string;
  selectedChapter: number;
  onSelectBook: (book: string) => void;
  onSelectChapter: (chapter: number) => void;
  onClose: () => void;
}

// Chapter counts for each book
const CHAPTER_COUNTS: Record<string, number> = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150, Proverbs: 31,
  Ecclesiastes: 12, "Song of Solomon": 8, Isaiah: 66, Jeremiah: 52,
  Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14, Joel: 3,
  Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3, Habakkuk: 3,
  Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
  Romans: 16, "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6,
  Ephesians: 6, Philippians: 4, Colossians: 4, "1 Thessalonians": 5,
  "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, Titus: 3,
  Philemon: 1, Hebrews: 13, James: 5, "1 Peter": 5, "2 Peter": 3,
  "1 John": 5, "2 John": 1, "3 John": 1, Jude: 1, Revelation: 22,
};

export function BibleSidebar({
  selectedBook,
  selectedChapter,
  onSelectBook,
  onSelectChapter,
  onClose,
}: BibleSidebarProps) {
  const t = useTranslations("bible");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBook, setExpandedBook] = useState<string | null>(selectedBook);

  // Filter books - search both English names and translated names
  const filteredBooks = BIBLE_BOOKS.filter((book) => {
    const translatedName = t(`books.${book}`);
    return book.toLowerCase().includes(searchQuery.toLowerCase()) ||
           translatedName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const oldTestament = filteredBooks.slice(0, 39);
  const newTestament = filteredBooks.slice(39);

  const handleBookClick = (book: string) => {
    if (expandedBook === book) {
      setExpandedBook(null);
    } else {
      setExpandedBook(book);
      onSelectBook(book);
    }
  };

  return (
    <div className="w-72 border-r bg-muted/30 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">{t("selectBook")}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("selectBook")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Books list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Old Testament */}
          {oldTestament.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                {t("oldTestament")}
              </h3>
              {oldTestament.map((book) => (
                <BookItem
                  key={book}
                  book={book}
                  displayName={t(`books.${book}`)}
                  isSelected={selectedBook === book}
                  isExpanded={expandedBook === book}
                  selectedChapter={selectedBook === book ? selectedChapter : null}
                  chapterCount={CHAPTER_COUNTS[book] || 1}
                  onBookClick={() => handleBookClick(book)}
                  onChapterClick={(ch) => {
                    onSelectBook(book);
                    onSelectChapter(ch);
                  }}
                />
              ))}
            </div>
          )}

          {/* New Testament */}
          {newTestament.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
                {t("newTestament")}
              </h3>
              {newTestament.map((book) => (
                <BookItem
                  key={book}
                  book={book}
                  displayName={t(`books.${book}`)}
                  isSelected={selectedBook === book}
                  isExpanded={expandedBook === book}
                  selectedChapter={selectedBook === book ? selectedChapter : null}
                  chapterCount={CHAPTER_COUNTS[book] || 1}
                  onBookClick={() => handleBookClick(book)}
                  onChapterClick={(ch) => {
                    onSelectBook(book);
                    onSelectChapter(ch);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface BookItemProps {
  book: string;
  displayName: string;
  isSelected: boolean;
  isExpanded: boolean;
  selectedChapter: number | null;
  chapterCount: number;
  onBookClick: () => void;
  onChapterClick: (chapter: number) => void;
}

function BookItem({
  book,
  displayName,
  isSelected,
  isExpanded,
  selectedChapter,
  chapterCount,
  onBookClick,
  onChapterClick,
}: BookItemProps) {
  return (
    <div className="mb-1">
      <button
        onClick={onBookClick}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
          isSelected
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-muted text-foreground"
        )}
      >
        <span>{displayName}</span>
        <ChevronRight
          className={cn(
            "w-4 h-4 transition-transform",
            isExpanded && "rotate-90"
          )}
        />
      </button>

      {/* Chapters grid */}
      {isExpanded && (
        <div className="grid grid-cols-5 gap-1 p-2 bg-muted/50 rounded-lg mt-1 mb-2">
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((ch) => (
            <button
              key={ch}
              onClick={() => onChapterClick(ch)}
              className={cn(
                "w-full aspect-square flex items-center justify-center text-xs rounded transition-colors",
                selectedChapter === ch
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-muted-foreground/20"
              )}
            >
              {ch}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
