"use client";

import { motion } from "framer-motion";
import { BookOpen, Heart, Sparkles, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  const t = useTranslations("chat");

  const prompts = [
    {
      icon: BookOpen,
      title: t("prompts.explainVerse"),
      prompt: t("prompts.explainVerseText"),
      color: "text-scripture-olive",
    },
    {
      icon: Sparkles,
      title: t("prompts.dailyDevotional"),
      prompt: t("prompts.dailyDevotionalText"),
      color: "text-scripture-gold",
    },
    {
      icon: Heart,
      title: t("prompts.spiritualGuidance"),
      prompt: t("prompts.spiritualGuidanceText"),
      color: "text-red-500",
    },
    {
      icon: HelpCircle,
      title: t("prompts.biblicalQuestion"),
      prompt: t("prompts.biblicalQuestionText"),
      color: "text-scripture-sky",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
      {prompts.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.1 }}
        >
          <Card
            className="p-4 cursor-pointer hover:bg-muted/50 hover:border-primary/30 transition-all group"
            onClick={() => onSelect(item.prompt)}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {item.prompt}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
