/**
 * GetBible.net API Integration
 * Free API with 100+ Bible translations in many languages
 * Documentation: https://getbible.net/api
 * 
 * This serves as a reliable fallback when Bolls.life is unavailable
 */

const GETBIBLE_API_BASE = "https://api.getbible.net/v2";

// Map our app locale codes to GetBible.net translation codes
// These are verified working translation codes
export const GETBIBLE_TRANSLATIONS: Record<string, { id: string; name: string; abbreviation: string }[]> = {
  en: [
    { id: "kjv", name: "King James Version", abbreviation: "KJV" },
    { id: "asv", name: "American Standard Version", abbreviation: "ASV" },
    { id: "web", name: "World English Bible", abbreviation: "WEB" },
    { id: "ylt", name: "Young's Literal Translation", abbreviation: "YLT" },
    { id: "basicenglish", name: "Basic English Bible", abbreviation: "BBE" },
  ],
  es: [
    { id: "valera", name: "Reina Valera (1909)", abbreviation: "RV09" },
    { id: "sse", name: "Sagradas Escrituras (1569)", abbreviation: "SSE" },
  ],
  de: [
    { id: "schlachter", name: "Schlachter (1951)", abbreviation: "SCH" },
    { id: "elberfelder", name: "Elberfelder (1871)", abbreviation: "ELB" },
    { id: "elberfelder1905", name: "Elberfelder (1905)", abbreviation: "ELB05" },
    { id: "luther1545", name: "Luther (1545)", abbreviation: "LUT45" },
  ],
  fr: [
    { id: "ls1910", name: "Louis Segond (1910)", abbreviation: "LSG" },
    { id: "martin", name: "Martin (1744)", abbreviation: "MAR" },
    { id: "darby", name: "Darby", abbreviation: "DBY" },
  ],
  pt: [
    { id: "almeida", name: "Almeida Atualizada", abbreviation: "AA" },
    { id: "livre", name: "Bíblia Livre", abbreviation: "BL" },
  ],
  it: [
    { id: "riveduta", name: "Riveduta Bible (1927)", abbreviation: "RIV" },
    { id: "giovanni", name: "Giovanni Diodati Bible (1649)", abbreviation: "DIO" },
  ],
  zh: [
    { id: "cns", name: "NCV Simplified", abbreviation: "NCVS" },
    { id: "cnt", name: "NCV Traditional", abbreviation: "NCVT" },
    { id: "cus", name: "Union Simplified", abbreviation: "CUS" },
    { id: "cut", name: "Union Traditional", abbreviation: "CUT" },
  ],
};

// Book ID mapping (GetBible uses 1-66 for standard Protestant canon)
const BOOK_NAME_TO_ID: Record<string, number> = {
  "Genesis": 1, "Exodus": 2, "Leviticus": 3, "Numbers": 4, "Deuteronomy": 5,
  "Joshua": 6, "Judges": 7, "Ruth": 8, "1 Samuel": 9, "2 Samuel": 10,
  "1 Kings": 11, "2 Kings": 12, "1 Chronicles": 13, "2 Chronicles": 14,
  "Ezra": 15, "Nehemiah": 16, "Esther": 17, "Job": 18, "Psalms": 19,
  "Proverbs": 20, "Ecclesiastes": 21, "Song of Solomon": 22, "Isaiah": 23,
  "Jeremiah": 24, "Lamentations": 25, "Ezekiel": 26, "Daniel": 27,
  "Hosea": 28, "Joel": 29, "Amos": 30, "Obadiah": 31, "Jonah": 32,
  "Micah": 33, "Nahum": 34, "Habakkuk": 35, "Zephaniah": 36, "Haggai": 37,
  "Zechariah": 38, "Malachi": 39, "Matthew": 40, "Mark": 41, "Luke": 42,
  "John": 43, "Acts": 44, "Romans": 45, "1 Corinthians": 46, "2 Corinthians": 47,
  "Galatians": 48, "Ephesians": 49, "Philippians": 50, "Colossians": 51,
  "1 Thessalonians": 52, "2 Thessalonians": 53, "1 Timothy": 54, "2 Timothy": 55,
  "Titus": 56, "Philemon": 57, "Hebrews": 58, "James": 59, "1 Peter": 60,
  "2 Peter": 61, "1 John": 62, "2 John": 63, "3 John": 64, "Jude": 65,
  "Revelation": 66,
};

export interface GetBibleVerse {
  chapter: number;
  verse: number;
  name: string;
  text: string;
}

export interface GetBibleChapterResponse {
  translation: string;
  abbreviation: string;
  language: string;
  book_nr: number;
  book_name: string;
  chapter: number;
  verses: GetBibleVerse[];
}

export interface GetBibleChapterResult {
  book: string;
  chapter: number;
  translation: string;
  translationName: string;
  verses: { verse: number; text: string }[];
  source: "getbible";
  language: string;
}

/**
 * Get the book ID from a book name
 */
export function getBookId(bookName: string): number | null {
  // Try exact match first
  if (BOOK_NAME_TO_ID[bookName]) {
    return BOOK_NAME_TO_ID[bookName];
  }
  
  // Try case-insensitive match
  const normalized = bookName.trim();
  for (const [name, id] of Object.entries(BOOK_NAME_TO_ID)) {
    if (name.toLowerCase() === normalized.toLowerCase()) {
      return id;
    }
  }
  
  return null;
}

/**
 * Get the default translation ID for a language
 */
export function getDefaultGetBibleTranslation(locale: string): string {
  const translations = GETBIBLE_TRANSLATIONS[locale];
  if (translations && translations.length > 0) {
    return translations[0].id;
  }
  return "kjv"; // Default to KJV
}

/**
 * Get available translations for a language from GetBible.net
 */
export function getGetBibleTranslations(locale: string): { id: string; name: string; abbreviation: string }[] {
  return GETBIBLE_TRANSLATIONS[locale] || GETBIBLE_TRANSLATIONS["en"];
}

/**
 * Fetch a chapter from GetBible.net
 */
export async function fetchGetBibleChapter(
  bookName: string,
  chapter: number,
  locale: string = "en",
  translationId?: string
): Promise<GetBibleChapterResult | null> {
  const bookId = getBookId(bookName);
  if (!bookId) {
    console.error(`GetBible: Unknown book: ${bookName}`);
    return null;
  }

  // Use provided translation or get default for locale
  const transId = translationId || getDefaultGetBibleTranslation(locale);
  const translations = GETBIBLE_TRANSLATIONS[locale] || GETBIBLE_TRANSLATIONS["en"];
  const translationInfo = translations.find(t => t.id === transId) || { id: transId, name: transId, abbreviation: transId };

  try {
    const url = `${GETBIBLE_API_BASE}/${transId}/${bookId}/${chapter}.json`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000), // 15 second timeout
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`GetBible API error: ${response.status} for ${url}`);
      return null;
    }

    const data: GetBibleChapterResponse = await response.json();

    if (!data.verses || data.verses.length === 0) {
      return null;
    }

    // Clean HTML tags and extra whitespace from verse text
    const cleanText = (text: string) => {
      return text
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    return {
      book: bookName,
      chapter,
      translation: translationInfo.abbreviation,
      translationName: translationInfo.name,
      verses: data.verses.map((v) => ({
        verse: v.verse,
        text: cleanText(v.text),
      })),
      source: "getbible",
      language: locale,
    };
  } catch (error) {
    console.error("GetBible.net fetch error:", error);
    return null;
  }
}

/**
 * Search the Bible using GetBible.net
 * Note: GetBible.net doesn't have a search endpoint, so we return null
 * and let the fallback system handle it
 */
export async function searchGetBible(
  query: string,
  locale: string = "en"
): Promise<null> {
  // GetBible.net doesn't support search
  // Return null to let fallback handle it
  return null;
}

/**
 * Check if GetBible.net API is available
 */
export async function checkGetBibleHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${GETBIBLE_API_BASE}/kjv/43/3.json`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get list of all available translations from GetBible.net
 */
export async function fetchGetBibleTranslationsList(): Promise<Record<string, { translation: string; language: string }> | null> {
  try {
    const response = await fetch(`${GETBIBLE_API_BASE}/translations.json`, {
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch GetBible translations list:", error);
    return null;
  }
}
