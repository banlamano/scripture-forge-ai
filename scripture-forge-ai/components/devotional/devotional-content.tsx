"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, BookOpen, Heart } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

// Locale mapping for date formatting
const localeMap: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  fr: "fr-FR",
  pt: "pt-BR",
  zh: "zh-CN",
};

export function DevotionalContent() {
  const t = useTranslations("devotional");
  const tCommon = useTranslations("common");
  const { locale } = useLanguage();
  
  const todayDate = new Date().toLocaleDateString(localeMap[locale] || "en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  // Get translated further reading references
  const furtherReadingKeys = ["reading1", "reading2", "reading3"] as const;

  return (
    <div className="container max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-scripture-gold/10 text-scripture-gold text-sm font-medium mb-4">
          <Calendar className="w-4 h-4" />
          {todayDate}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">
          {t("todaysDevotional")}
        </p>
      </div>

      {/* Scripture Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <blockquote className="scripture-text text-xl md:text-2xl text-center italic mb-4">
            &ldquo;{t("verseText")}&rdquo;
          </blockquote>
          <p className="text-center text-primary font-medium">
            — {t("verseReference")} (NIV)
          </p>
        </CardContent>
      </Card>

      {/* Reflection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-scripture-gold" />
            {t("reflection")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose-scripture">
            <p className="mb-4 leading-relaxed">
              {t("reflectionContent")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prayer Focus */}
      <Card className="mb-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            {t("prayerFocus")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="italic leading-relaxed">{t("prayerContent")}</p>
        </CardContent>
      </Card>

      {/* Further Reading */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-scripture-olive" />
            {t("readMore")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {furtherReadingKeys.map((key) => (
              <Link
                key={key}
                href={`/bible?ref=${encodeURIComponent(t(key))}`}
                className="px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
              >
                {t(key)}
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
