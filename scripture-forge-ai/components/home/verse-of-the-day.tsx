"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { RefreshCw, Share2, BookmarkPlus, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/providers/language-provider";

// Popular verses with their references (book, chapter, verse)
const verseReferences = [
  { book: "Jeremiah", chapter: 29, verse: 11, reference: "Jeremiah 29:11" },
  { book: "Proverbs", chapter: 3, verses: [5, 6], reference: "Proverbs 3:5-6" },
  { book: "Philippians", chapter: 4, verse: 13, reference: "Philippians 4:13" },
  { book: "John", chapter: 3, verse: 16, reference: "John 3:16" },
  { book: "Psalms", chapter: 23, verse: 1, reference: "Psalm 23:1" },
  { book: "Romans", chapter: 8, verse: 28, reference: "Romans 8:28" },
  { book: "Isaiah", chapter: 41, verse: 10, reference: "Isaiah 41:10" },
];

// Default translation IDs by locale (using Bolls.life for non-English)
const defaultTranslations: Record<string, { id: string; name: string }> = {
  en: { id: "KJV", name: "KJV" },
  fr: { id: "FRLSG", name: "LSG" },
  de: { id: "LUT", name: "Luther" },
  es: { id: "RV1960", name: "RV60" },
  pt: { id: "ARA", name: "ARA" },
  zh: { id: "KJV", name: "KJV" }, // Fallback to English for Chinese
  it: { id: "NR06", name: "NR06" },
};

interface VerseData {
  text: string;
  reference: string;
  translation: string;
}

export function VerseOfTheDay() {
  const t = useTranslations("common");
  const { locale } = useLanguage();
  const [currentVerse, setCurrentVerse] = useState<VerseData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchVerse = useCallback(async (index: number) => {
    const ref = verseReferences[index];
    const translation = defaultTranslations[locale] || defaultTranslations.en;
    
    try {
      // Fetch from Bolls.life API
      const bookIdMap: Record<string, number> = {
        "Genesis": 1, "Exodus": 2, "Psalms": 19, "Proverbs": 20,
        "Isaiah": 23, "Jeremiah": 24, "Matthew": 40, "John": 43,
        "Romans": 45, "Philippians": 50,
      };
      
      const bookId = bookIdMap[ref.book] || 1;
      const response = await fetch(
        `https://bolls.life/get-chapter/${translation.id}/${bookId}/${ref.chapter}/`
      );
      
      if (!response.ok) throw new Error("Failed to fetch verse");
      
      const data = await response.json();
      
      // Get the specific verse(s)
      let verseText = "";
      if (ref.verses) {
        // Multiple verses (e.g., Proverbs 3:5-6)
        const verses = data.filter((v: any) => 
          v.verse >= ref.verses[0] && v.verse <= ref.verses[1]
        );
        verseText = verses.map((v: any) => v.text).join(" ");
      } else {
        // Single verse
        const verse = data.find((v: any) => v.verse === ref.verse);
        verseText = verse?.text || "";
      }
      
      // Clean HTML tags, Strong's numbers, and verse numbers
      verseText = verseText
        .replace(/<S>\d+<\/S>/gi, "")  // Remove Strong's Concordance numbers <S>1234</S>
        .replace(/<[^>]+>/g, "")  // Remove other HTML tags
        .replace(/\[\d+\]/g, "")  // Remove [1], [2], etc.
        .replace(/\(\d+\)/g, "")  // Remove (1), (2), etc.
        .replace(/^\d+\s*/g, "")  // Remove leading verse numbers
        .replace(/\s+/g, " ")  // Normalize whitespace
        .trim();
      
      setCurrentVerse({
        text: verseText,
        reference: ref.reference,
        translation: translation.name,
      });
    } catch (error) {
      console.error("Error fetching verse:", error);
      // Fallback to a default message in the user's language
      const fallbackTexts: Record<string, { text: string; translation: string }> = {
        en: { text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", translation: "KJV" },
        fr: { text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance.", translation: "LSG" },
        de: { text: "Denn ich weiß, was für Gedanken ich über euch habe, spricht der HERR, Gedanken des Friedens und nicht des Leides, euch eine Zukunft und eine Hoffnung zu geben.", translation: "Luther" },
        es: { text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.", translation: "RVR" },
        pt: { text: "Porque eu sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.", translation: "ARA" },
        it: { text: "«Io, infatti, conosco i progetti che ho fatto a vostro riguardo», dice il Signore, «progetti di pace e non di sventura, per darvi un avvenire e una speranza.»", translation: "NR06" },
        zh: { text: "耶和华说：我知道我向你们所怀的意念，是赐平安的意念，不是降灾祸的意念，要叫你们末后有指望。", translation: "CCB" },
      };
      const fallback = fallbackTexts[locale] || fallbackTexts.en;
      setCurrentVerse({
        text: fallback.text,
        reference: "Jeremiah 29:11",
        translation: fallback.translation,
      });
    }
  }, [locale]);

  useEffect(() => {
    fetchVerse(currentIndex);
  }, [currentIndex, locale, fetchVerse]);

  const refreshVerse = () => {
    setIsRefreshing(true);
    const newIndex = (currentIndex + 1) % verseReferences.length;
    setCurrentIndex(newIndex);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const speakVerse = () => {
    if ("speechSynthesis" in window && currentVerse) {
      const utterance = new SpeechSynthesisUtterance(
        `${currentVerse.text} - ${currentVerse.reference}`
      );
      utterance.rate = 0.9;
      // Set language for better pronunciation
      const langMap: Record<string, string> = {
        en: "en-US", fr: "fr-FR", de: "de-DE", es: "es-ES", pt: "pt-BR", zh: "zh-CN", it: "it-IT"
      };
      utterance.lang = langMap[locale] || "en-US";
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">
              ✨ {t("devotional")}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={speakVerse}
                disabled={!currentVerse}
                className="h-8 w-8"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshVerse}
                disabled={isRefreshing || !currentVerse}
                className="h-8 w-8"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {currentVerse ? (
            <motion.div
              key={currentVerse.reference}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <blockquote className="scripture-text text-xl md:text-2xl mb-4 text-foreground">
                &ldquo;{currentVerse.text}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-primary font-medium">
                  — {currentVerse.reference}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({currentVerse.translation})
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    {t("save")}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    {t("share")}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
