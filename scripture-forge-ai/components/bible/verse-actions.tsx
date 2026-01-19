"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  
  const verseReference =
    selectedVerses.length === 1
      ? `${book} ${chapter}:${selectedVerses[0]}`
      : `${book} ${chapter}:${Math.min(...selectedVerses)}-${Math.max(...selectedVerses)}`;

  // Display text - show word if selected, otherwise verse reference
  const displayText = selectedWord 
    ? `"${selectedWord}" in ${verseReference}`
    : verseReference;

  // URL for AI chat - include word context if selected
  const chatUrl = selectedWord
    ? `/chat?word=${encodeURIComponent(selectedWord)}&verse=${encodeURIComponent(verseReference)}`
    : `/chat?verse=${encodeURIComponent(verseReference)}`;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass-card rounded-2xl p-4 shadow-xl border">
        <div className="flex items-center gap-3">
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
                <Button variant="ghost" size="icon">
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
    </motion.div>
  );
}
