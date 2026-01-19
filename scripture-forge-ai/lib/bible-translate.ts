/**
 * Bible Translation Service
 * Dynamically translates Bible verses to the user's language using AI
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Language names for translation prompts
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  pt: "Portuguese",
  zh: "Chinese (Simplified)",
};

export interface TranslatedVerse {
  number: number;
  text: string;
  originalText?: string;
}

/**
 * Translate Bible verses to a target language
 * Uses OpenAI for high-quality, contextual translation
 */
export async function translateVerses(
  verses: { verse: number; text: string }[],
  targetLanguage: string,
  book: string,
  chapter: number
): Promise<TranslatedVerse[]> {
  // If target is English, return as-is
  if (targetLanguage === "en") {
    return verses.map((v) => ({
      number: v.verse,
      text: v.text,
    }));
  }

  const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

  try {
    // Combine verses for batch translation (more efficient and maintains context)
    const versesText = verses
      .map((v) => `[${v.verse}] ${v.text}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a Bible translation assistant. Translate the following Bible verses from ${book} chapter ${chapter} into ${languageName}. 

Important guidelines:
- Maintain the sacred and reverent tone of scripture
- Keep verse numbers in brackets [X] at the start of each verse
- Preserve the meaning and theological accuracy
- Use formal/traditional language appropriate for scripture
- Do not add commentary or explanations
- Return ONLY the translated verses, one per line

Example format:
[1] Translated verse text here...
[2] Next translated verse...`,
        },
        {
          role: "user",
          content: versesText,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: 4000,
    });

    const translatedText = response.choices[0]?.message?.content || "";

    // Parse the translated verses
    const translatedVerses: TranslatedVerse[] = [];
    const lines = translatedText.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      const match = line.match(/^\[(\d+)\]\s*(.+)$/);
      if (match) {
        const verseNum = parseInt(match[1]);
        const originalVerse = verses.find((v) => v.verse === verseNum);
        translatedVerses.push({
          number: verseNum,
          text: match[2].trim(),
          originalText: originalVerse?.text,
        });
      }
    }

    // If parsing failed, return original with a note
    if (translatedVerses.length === 0) {
      return verses.map((v) => ({
        number: v.verse,
        text: v.text,
      }));
    }

    return translatedVerses;
  } catch (error) {
    console.error("Translation error:", error);
    // Return original verses on error
    return verses.map((v) => ({
      number: v.verse,
      text: v.text,
    }));
  }
}

/**
 * Translate a single verse (for verse of the day, etc.)
 */
export async function translateSingleVerse(
  text: string,
  targetLanguage: string,
  reference: string
): Promise<string> {
  if (targetLanguage === "en") {
    return text;
  }

  const languageName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Translate this Bible verse (${reference}) into ${languageName}. Maintain the sacred tone and theological accuracy. Return ONLY the translated verse, no explanations.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content?.trim() || text;
  } catch (error) {
    console.error("Single verse translation error:", error);
    return text;
  }
}
