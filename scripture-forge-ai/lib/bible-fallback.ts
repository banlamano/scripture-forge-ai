/**
 * Bible Fallback API
 * Provides alternative Bible sources when Bolls.life is unavailable
 * 
 * Fallback chain:
 * 1. Bolls.life (primary - best multilingual support)
 * 2. GetBible.net (multilingual - Spanish, German, French, Portuguese, Italian, Chinese)
 * 3. bible-api.com (English only - KJV, WEB, etc.)
 * 4. labs.bible.org (English NET Bible)
 */

import { fetchGetBibleChapter, checkGetBibleHealth } from "./getbible-api";

// Fallback translation mappings for bible-api.com (English translations only)
const BIBLE_API_TRANSLATIONS: Record<string, string> = {
  kjv: "kjv",
  web: "web",
  bbe: "bbe", // Bible in Basic English
  asv: "asv", // American Standard Version
  darby: "darby",
  ylt: "ylt", // Young's Literal Translation
};

// Book name to chapter count mapping for validation
const BOOK_CHAPTERS: Record<string, number> = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
  "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  "Ezra": 10, "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150,
  "Proverbs": 31, "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66,
  "Jeremiah": 52, "Lamentations": 5, "Ezekiel": 48, "Daniel": 12,
  "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1, "Jonah": 4,
  "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2,
  "Zechariah": 14, "Malachi": 4, "Matthew": 28, "Mark": 16, "Luke": 24,
  "John": 21, "Acts": 28, "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13,
  "Galatians": 6, "Ephesians": 6, "Philippians": 4, "Colossians": 4,
  "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4,
  "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5, "1 Peter": 5,
  "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1, "Jude": 1,
  "Revelation": 22,
};

export interface FallbackVerse {
  verse: number;
  text: string;
}

export interface FallbackChapterResult {
  book: string;
  chapter: number;
  translation: string;
  translationName: string;
  verses: FallbackVerse[];
  source: "bolls" | "getbible" | "bible-api" | "bible-org";
  language: string;
}

/**
 * Fetch from bible-api.com (English only)
 * Free API with KJV, WEB, ASV, etc.
 */
export async function fetchFromBibleApi(
  bookName: string,
  chapter: number,
  translation: string = "kjv"
): Promise<FallbackChapterResult | null> {
  try {
    const trans = BIBLE_API_TRANSLATIONS[translation.toLowerCase()] || "kjv";
    
    // Handle single-chapter books
    const singleChapterBooks: Record<string, number> = {
      "Obadiah": 21, "Philemon": 25, "2 John": 13, "3 John": 14, "Jude": 25,
    };
    
    let reference: string;
    const verseCount = singleChapterBooks[bookName];
    if (verseCount && chapter === 1) {
      reference = `${bookName} 1:1-${verseCount}`;
    } else {
      reference = `${bookName} ${chapter}`;
    }
    
    const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${trans}`;
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      console.error(`bible-api.com error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.verses || data.verses.length === 0) {
      return null;
    }
    
    const translationNames: Record<string, string> = {
      kjv: "King James Version",
      web: "World English Bible",
      bbe: "Bible in Basic English",
      asv: "American Standard Version",
      darby: "Darby Translation",
      ylt: "Young's Literal Translation",
    };
    
    return {
      book: bookName,
      chapter,
      translation: trans.toUpperCase(),
      translationName: translationNames[trans] || trans,
      verses: data.verses.map((v: { verse: number; text: string }) => ({
        verse: v.verse,
        text: v.text.trim(),
      })),
      source: "bible-api",
      language: "en",
    };
  } catch (error) {
    console.error("bible-api.com fetch error:", error);
    return null;
  }
}

/**
 * Fetch from labs.bible.org (NET Bible - English only)
 */
export async function fetchFromBibleOrg(
  bookName: string,
  chapter: number
): Promise<FallbackChapterResult | null> {
  try {
    // bible.org uses lowercase book names with + for spaces
    const formattedBook = bookName.toLowerCase().replace(/ /g, "+");
    const url = `https://labs.bible.org/api/?passage=${formattedBook}+${chapter}&type=json`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      console.error(`labs.bible.org error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    // Group by verse number and clean text
    const verses: FallbackVerse[] = data.map((v: { verse: string; text: string }) => ({
      verse: parseInt(v.verse),
      text: v.text
        .replace(/<[^>]+>/g, "") // Remove HTML tags
        .replace(/\s+/g, " ")
        .trim(),
    }));
    
    return {
      book: bookName,
      chapter,
      translation: "NET",
      translationName: "New English Translation",
      verses,
      source: "bible-org",
      language: "en",
    };
  } catch (error) {
    console.error("labs.bible.org fetch error:", error);
    return null;
  }
}

/**
 * Try multiple fallback sources in order
 * Returns the first successful result
 * 
 * Fallback order:
 * 1. GetBible.net (multilingual support)
 * 2. bible-api.com (English)
 * 3. labs.bible.org (English NET Bible)
 */
export async function fetchWithFallback(
  bookName: string,
  chapter: number,
  preferredTranslation: string = "kjv",
  targetLanguage: string = "en"
): Promise<FallbackChapterResult | null> {
  
  // First, try GetBible.net (has multilingual support!)
  try {
    const getBibleResult = await fetchGetBibleChapter(bookName, chapter, targetLanguage);
    if (getBibleResult && getBibleResult.verses.length > 0) {
      console.log(`Fallback: Using GetBible.net (${getBibleResult.translation}) for ${bookName} ${chapter} [${targetLanguage}]`);
      return {
        book: getBibleResult.book,
        chapter: getBibleResult.chapter,
        translation: getBibleResult.translation,
        translationName: getBibleResult.translationName,
        verses: getBibleResult.verses,
        source: "getbible" as const,
        language: getBibleResult.language,
      };
    }
  } catch (error) {
    console.error("GetBible.net fallback failed:", error);
  }
  
  // For English, also try bible-api.com (more English translations)
  if (targetLanguage === "en") {
    const bibleApiResult = await fetchFromBibleApi(bookName, chapter, preferredTranslation);
    if (bibleApiResult) {
      console.log(`Fallback: Using bible-api.com for ${bookName} ${chapter}`);
      return bibleApiResult;
    }
    
    // Try bible.org as last resort for English
    const bibleOrgResult = await fetchFromBibleOrg(bookName, chapter);
    if (bibleOrgResult) {
      console.log(`Fallback: Using labs.bible.org for ${bookName} ${chapter}`);
      return bibleOrgResult;
    }
  }
  
  // Ultimate fallback: English KJV from bible-api.com
  const englishFallback = await fetchFromBibleApi(bookName, chapter, "kjv");
  if (englishFallback) {
    console.log(`Fallback: Using English KJV for ${bookName} ${chapter} (target was ${targetLanguage})`);
    return englishFallback;
  }
  
  return null;
}

/**
 * Check if fallback APIs are available
 */
export async function checkFallbackHealth(): Promise<{
  getBible: boolean;
  bibleApi: boolean;
  bibleOrg: boolean;
}> {
  const results = {
    getBible: false,
    bibleApi: false,
    bibleOrg: false,
  };
  
  // Check GetBible.net (multilingual)
  try {
    results.getBible = await checkGetBibleHealth();
  } catch {
    results.getBible = false;
  }
  
  // Check bible-api.com (English)
  try {
    const bibleApiResponse = await fetch("https://bible-api.com/john+3:16", {
      signal: AbortSignal.timeout(5000)
    });
    results.bibleApi = bibleApiResponse.ok;
  } catch {
    results.bibleApi = false;
  }
  
  // Check labs.bible.org (English NET)
  try {
    const bibleOrgResponse = await fetch("https://labs.bible.org/api/?passage=john+3:16&type=json", {
      signal: AbortSignal.timeout(5000)
    });
    results.bibleOrg = bibleOrgResponse.ok;
  } catch {
    results.bibleOrg = false;
  }
  
  return results;
}
