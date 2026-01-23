"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Bookmark,
  Highlighter,
  StickyNote,
  Share2,
  Sparkles,
  Copy,
  X,
  MoreHorizontal,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/components/providers/language-provider";

interface VerseActionsProps {
  selectedVerses: number[];
  book: string;
  chapter: number;
  onClear: () => void;
  selectedWord?: string; // Optional: if provided, we're in word mode
}

export function VerseActions({
  selectedVerses,
  book,
  chapter,
  onClear,
  selectedWord,
}: VerseActionsProps) {
  const t = useTranslations("bible");
  const tCommon = useTranslations("common");
  const { locale } = useLanguage();
  const [showMoreActions, setShowMoreActions] = useState(false);
  
  const verseReference =
    selectedVerses.length === 1
      ? `${book} ${chapter}:${selectedVerses[0]}`
      : `${book} ${chapter}:${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)}`;

  // Display text - show word if selected, otherwise verse reference
  const displayText = selectedWord 
    ? `"${selectedWord}" in ${verseReference}`
    : verseReference;

  // URL for AI chat - include word context and language if selected
  const chatUrl = selectedWord
    ? `/chat?word=${encodeURIComponent(selectedWord)}&verse=${encodeURIComponent(verseReference)}&lang=${locale}`
    : `/chat?verse=${encodeURIComponent(verseReference)}&lang=${locale}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verseReference);
      toast.success(tCommon("copied"));
    } catch {
      toast.error(tCommon("error"));
    }
  };

  const handleBookmark = () => {
    toast.success(t("bookmark"), {
      description: verseReference,
    });
  };

  const handleHighlight = () => {
    toast.success(t("highlight"), {
      description: verseReference,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: verseReference,
          text: displayText,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success(tCommon("copied"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed left-0 right-0 z-50 p-3 bottom-[calc(4rem+env(safe-area-inset-bottom))] sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:p-0 md:bottom-6"
    >
      <div className="glass-card rounded-2xl shadow-xl border mx-auto max-w-lg bg-background/95 backdrop-blur-lg">
        {/* Mobile expanded actions panel */}
        <AnimatePresence>
          {showMoreActions && !selectedWord && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b"
            >
              <div className="p-3 grid grid-cols-4 gap-2">
                <button
                  onClick={handleBookmark}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <Bookmark className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">{t("bookmark")}</span>
                </button>
                <button
                  onClick={handleHighlight}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <Highlighter className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">{t("highlight")}</span>
                </button>
                <button
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <StickyNote className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">{t("addNote") || "Note"}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted active:bg-muted/80 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium">{t("share") || "Share"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main action bar */}
        <div className="p-3 sm:p-4">
          {/* Mobile layout - stacked */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* Reference and close */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary truncate flex-1 mr-2">
                {displayText}
              </span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClear}
                className="shrink-0 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCopy}
                className="h-10 w-10 shrink-0"
              >
                <Copy className="w-5 h-5" />
              </Button>
              
              {!selectedWord && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className="h-10 w-10 shrink-0"
                >
                  {showMoreActions ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <MoreHorizontal className="w-5 h-5" />
                  )}
                </Button>
              )}
              
              <Button 
                variant="default" 
                className="flex-1 h-10 text-sm font-medium" 
                asChild
              >
                <Link href={chatUrl}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {selectedWord ? t("explainWord") : t("askAI")}
                </Link>
              </Button>
            </div>
          </div>

          {/* Desktop/Tablet layout - horizontal */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm font-medium text-primary max-w-[200px] truncate">
              {displayText}
            </span>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
              {!selectedWord && (
                <>
                  <Button variant="ghost" size="icon" onClick={handleBookmark}>
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleHighlight}>
                    <Highlighter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <StickyNote className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </>
              )}

              <div className="h-6 w-px bg-border mx-1" />

              <Button variant="default" size="sm" asChild>
                <Link href={chatUrl}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {selectedWord ? t("explainWord") : t("askAI")}
                </Link>
              </Button>
            </div>

            <Button variant="ghost" size="icon" onClick={onClear}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
