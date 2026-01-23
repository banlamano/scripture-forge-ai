"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, BookOpen, Heart, RefreshCw } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { getDailyDevotional, type Devotional } from "@/lib/devotionals-data";
import { useMemo, useState } from "react";

// Locale mapping for date formatting
const localeMap: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
  pt: "pt-BR",
  zh: "zh-CN",
  it: "it-IT",
};

export function DevotionalContent() {
  const t = useTranslations("devotional");
  const tCommon = useTranslations("common");
  const { locale } = useLanguage();
  
  // Get today's date for display
  const todayDate = new Date().toLocaleDateString(localeMap[locale] || "en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  // Get the daily devotional based on current date and locale
  const dailyDevotional = useMemo(() => getDailyDevotional(new Date(), locale), [locale]);

  return (
    <div className="container max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-scripture-gold/10 text-scripture-gold text-xs sm:text-sm font-medium mb-3 sm:mb-4">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {todayDate}
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          {t("title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {dailyDevotional.theme}
        </p>
      </div>

      {/* Scripture Card */}
      <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
          <blockquote className="scripture-text text-lg sm:text-xl md:text-2xl text-center italic mb-3 sm:mb-4 leading-relaxed">
            &ldquo;{dailyDevotional.verseText}&rdquo;
          </blockquote>
          <p className="text-center text-primary font-medium text-sm sm:text-base">
            — {dailyDevotional.verseReference} (NIV)
          </p>
        </CardContent>
      </Card>

      {/* Reflection */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-scripture-gold" />
            {t("reflection")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose-scripture">
            <p className="mb-4 leading-relaxed text-sm sm:text-base">
              {dailyDevotional.reflection}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prayer Focus */}
      <Card className="mb-6 sm:mb-8 bg-muted/50">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            {t("prayerFocus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="italic leading-relaxed text-sm sm:text-base">{dailyDevotional.prayer}</p>
        </CardContent>
      </Card>

      {/* Further Reading */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-scripture-olive" />
            {t("readMore")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dailyDevotional.furtherReading.map((reference) => (
              <Link
                key={reference}
                href={`/bible?ref=${encodeURIComponent(reference)}`}
                className="px-3 py-2 sm:py-1.5 rounded-full bg-muted hover:bg-muted/80 active:bg-muted/60 text-sm font-medium transition-colors touch-manipulation"
              >
                {reference}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Button asChild>
          <Link href="/chat">
            <Sparkles className="w-4 h-4 mr-2" />
            {tCommon("chat")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
