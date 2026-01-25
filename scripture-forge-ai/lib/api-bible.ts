/**
 * API.Bible Integration
 * Free API with 2500+ Bible translations in 1600+ languages
 * Register at: https://scripture.api.bible/
 * 
 * Also integrates with Bolls.life for additional free translations
 * including French (Louis Segond), German (Luther), Spanish (Reina Valera), etc.
 */

import {
  hasBollsTranslation,
  getDefaultBollsTranslation,
  getBollsTranslations,
  fetchBollsChapter,
  BOLLS_TRANSLATIONS,
} from "./bolls-bible";

const API_BIBLE_BASE = "https://rest.api.bible/v1";

// Get API key from environment
const getApiKey = () => process.env.API_BIBLE_KEY || "";

// Map app locale codes to API.Bible ISO-639-3 language codes
export const LOCALE_TO_API_LANG: Record<string, string> = {
  en: "eng",
  es: "spa",
  de: "deu",
  fr: "fra",
  pt: "por",
  zh: "cmn", // Mandarin Chinese
  it: "ita", // Italian
};

// Popular free translations by language (verified working IDs from API.Bible)
// These are Bible IDs from API.Bible - using app locale codes as keys
// Languages with Bolls.life translations will use those instead (marked with "bolls:" prefix)
export const BIBLE_TRANSLATIONS: Record<string, { id: string; name: string; abbreviation: string }[]> = {
  en: [
    { id: "06125adad2d5898a-01", name: "American Standard Version", abbreviation: "ASV" },
    { id: "55212e3cf5d04d49-01", name: "King James Version", abbreviation: "KJV" },
    { id: "65eec8e0b60e656b-01", name: "Free Bible Version", abbreviation: "FBV" },
    { id: "179568874c45066f-01", name: "Douay-Rheims American 1899", abbreviation: "DRA" },
    // Bolls.life English translations
    { id: "bolls:YLT", name: "Young's Literal Translation", abbreviation: "YLT" },
    { id: "bolls:WEB", name: "World English Bible", abbreviation: "WEB" },
  ],
  es: [
    // Bolls.life Spanish translations (free, no API key needed) - listed first as default
    { id: "bolls:RV1960", name: "Reina Valera 1960", abbreviation: "RV60" },
    { id: "bolls:NVI", name: "Nueva Versión Internacional", abbreviation: "NVI" },
    { id: "bolls:NTV", name: "Nueva Traducción Viviente", abbreviation: "NTV" },
    { id: "bolls:LBLA", name: "La Biblia de las Américas", abbreviation: "LBLA" },
    // API.Bible Spanish translations (requires API key)
    { id: "592420522e16049f-01", name: "Reina Valera 1909 (API)", abbreviation: "RVR09" },
    { id: "b32b9d1b64b4ef29-01", name: "Biblia Simple", abbreviation: "BSB" },
  ],
  de: [
    // Bolls.life German translations (free, no API key needed) - listed first as default
    { id: "bolls:HFA", name: "Hoffnung für Alle 2015", abbreviation: "HFA" },
    { id: "bolls:LUT", name: "Luther 1912", abbreviation: "LUT" },
    { id: "bolls:SCH", name: "Schlachter 1951", abbreviation: "SCH" },
    { id: "bolls:S00", name: "Schlachter 2000", abbreviation: "S00" },
    { id: "bolls:MB", name: "Menge-Bibel", abbreviation: "MB" },
    // API.Bible German translations (requires API key)
    { id: "926aa5efbc5e04e2-01", name: "Luther Bibel 1912 (API)", abbreviation: "LUT12" },
    { id: "95410db44ef800c1-01", name: "Elberfelder Bibel", abbreviation: "ELB" },
  ],
  fr: [
    // French translations from Bolls.life (API.Bible doesn't have French in free tier)
    { id: "bolls:FRLSG", name: "Louis Segond 1910", abbreviation: "LSG" },
    { id: "bolls:NBS", name: "Nouvelle Bible Segond 2002", abbreviation: "NBS" },
    { id: "bolls:FRDBY", name: "Bible de Darby 1890", abbreviation: "DBY" },
    { id: "bolls:FRPDV17", name: "Parole de Vie 2017", abbreviation: "PDV" },
  ],
  pt: [
    // Bolls.life Portuguese translations (free, no API key needed) - listed first as default
    { id: "bolls:ARA", name: "Almeida Revista e Atualizada", abbreviation: "ARA" },
    { id: "bolls:NAA", name: "Nova Almeida Atualizada 2017", abbreviation: "NAA" },
    { id: "bolls:NTLH", name: "Nova Tradução na Linguagem de Hoje", abbreviation: "NTLH" },
    // API.Bible Portuguese translations (requires API key)
    { id: "d63894c8d9a7a503-01", name: "Bíblia Livre Para Todos", abbreviation: "BLT" },
    { id: "90799bb5b996fddc-01", name: "Tradução para Tradutores", abbreviation: "TfT" },
  ],
  zh: [
    // Bolls.life Chinese translations (free, no API key needed) - listed first as default
    { id: "bolls:CUNPS", name: "Chinese Union New Punctuation (Simplified)", abbreviation: "CUNPS" },
    { id: "bolls:CUV", name: "Chinese Union (Traditional)", abbreviation: "CUV" },
    { id: "bolls:CUNP", name: "Chinese Union New Punctuation (Traditional)", abbreviation: "CUNP" },
    // API.Bible Chinese translations (requires API key)
    { id: "7ea794434e9ea7ee-01", name: "当代译本 (简体)", abbreviation: "CCB" },
    { id: "a6e06d2c5b90ad89-01", name: "當代譯本 (繁體)", abbreviation: "CCBT" },
  ],
  it: [
    // Bolls.life Italian translations (free, no API key needed)
    { id: "bolls:NR06", name: "Nuova Riveduta 2006", abbreviation: "NR06" },
    { id: "bolls:CEI", name: "Conferenza Episcopale Italiana 2008", abbreviation: "CEI" },
    { id: "bolls:VULG", name: "Biblia Sacra Vulgata (Latin)", abbreviation: "VULG" },
    // API.Bible Italian translations (requires API key)
    { id: "41aa25bc421df6bc-01", name: "La Sacra Bibbia (Diodati)", abbreviation: "DIO" },
  ],
};

// Book name mappings (API.Bible uses specific book IDs)
const BOOK_IDS: Record<string, string> = {
  "Genesis": "GEN",
  "Exodus": "EXO",
  "Leviticus": "LEV",
  "Numbers": "NUM",
  "Deuteronomy": "DEU",
  "Joshua": "JOS",
  "Judges": "JDG",
  "Ruth": "RUT",
  "1 Samuel": "1SA",
  "2 Samuel": "2SA",
  "1 Kings": "1KI",
  "2 Kings": "2KI",
  "1 Chronicles": "1CH",
  "2 Chronicles": "2CH",
  "Ezra": "EZR",
  "Nehemiah": "NEH",
  "Esther": "EST",
  "Job": "JOB",
  "Psalms": "PSA",
  "Psalm": "PSA",
  "Proverbs": "PRO",
  "Ecclesiastes": "ECC",
  "Song of Solomon": "SNG",
  "Isaiah": "ISA",
  "Jeremiah": "JER",
  "Lamentations": "LAM",
  "Ezekiel": "EZK",
  "Daniel": "DAN",
  "Hosea": "HOS",
  "Joel": "JOL",
  "Amos": "AMO",
  "Obadiah": "OBA",
  "Jonah": "JON",
  "Micah": "MIC",
  "Nahum": "NAM",
  "Habakkuk": "HAB",
  "Zephaniah": "ZEP",
  "Haggai": "HAG",
  "Zechariah": "ZEC",
  "Malachi": "MAL",
  "Matthew": "MAT",
  "Mark": "MRK",
  "Luke": "LUK",
  "John": "JHN",
  "Acts": "ACT",
  "Romans": "ROM",
  "1 Corinthians": "1CO",
  "2 Corinthians": "2CO",
  "Galatians": "GAL",
  "Ephesians": "EPH",
  "Philippians": "PHP",
  "Colossians": "COL",
  "1 Thessalonians": "1TH",
  "2 Thessalonians": "2TH",
  "1 Timothy": "1TI",
  "2 Timothy": "2TI",
  "Titus": "TIT",
  "Philemon": "PHM",
  "Hebrews": "HEB",
  "James": "JAS",
  "1 Peter": "1PE",
  "2 Peter": "2PE",
  "1 John": "1JN",
  "2 John": "2JN",
  "3 John": "3JN",
  "Jude": "JUD",
  "Revelation": "REV",
};

export interface ApiBibleVerse {
  id: string;
  orgId: string;
  bookId: string;
  chapterId: string;
  reference: string;
  content: string;
}

export interface ApiBibleChapter {
  id: string;
  bibleId: string;
  bookId: string;
  number: string;
  content: string;
  reference: string;
}

/**
 * Get the book ID for API.Bible
 */
export function getBookId(bookName: string): string | null {
  return BOOK_IDS[bookName] || null;
}

/**
 * Get available translations for a language
 */
export function getTranslationsForLanguage(language: string): { id: string; name: string; abbreviation: string }[] {
  return BIBLE_TRANSLATIONS[language] || BIBLE_TRANSLATIONS["en"];
}

/**
 * Get the default Bible ID for a language
 */
export function getDefaultBibleId(language: string): string {
  const translations = BIBLE_TRANSLATIONS[language];
  if (translations && translations.length > 0) {
    return translations[0].id;
  }
  // Default to ASV (English)
  return "06125adad2d5898a-01";
}

/**
 * Check if a translation ID is from Bolls.life
 */
export function isBollsTranslation(translationId: string): boolean {
  return translationId.startsWith("bolls:");
}

/**
 * Extract the Bolls.life translation code from a prefixed ID
 */
export function getBollsTranslationCode(translationId: string): string {
  return translationId.replace("bolls:", "");
}

/**
 * Fetch a chapter from API.Bible or Bolls.life (depending on translation ID)
 */
export async function fetchChapterFromApiBible(
  bibleId: string,
  bookName: string,
  chapter: number
): Promise<{ book: string; chapter: number; translation: string; verses: { verse: number; text: string }[] } | null> {
  
  // Handle Bolls.life translations (prefixed with "bolls:")
  if (isBollsTranslation(bibleId)) {
    const bollsId = getBollsTranslationCode(bibleId);
    const result = await fetchBollsChapter(bookName, chapter, bollsId);
    if (result) {
      return {
        book: result.book,
        chapter: result.chapter,
        translation: bibleId,
        verses: result.verses,
      };
    }
    return null;
  }

  // Handle API.Bible translations
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("API_BIBLE_KEY not set");
    return null;
  }

  const bookId = getBookId(bookName);
  if (!bookId) {
    console.error("Unknown book:", bookName);
    return null;
  }

  const chapterId = `${bookId}.${chapter}`;

  try {
    const response = await fetch(
      `${API_BIBLE_BASE}/bibles/${bibleId}/chapters/${chapterId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true`,
      {
        headers: {
          "api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error("API.Bible error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.data?.content || "";
    
    // Parse verses from the content
    // API.Bible returns content with verse numbers like [1] or (1)
    const verses = parseVersesFromContent(content);

    return {
      book: bookName,
      chapter,
      translation: bibleId,
      verses,
    };
  } catch (error) {
    console.error("API.Bible fetch error:", error);
    return null;
  }
}

/**
 * Fetch verses from API.Bible or Bolls.life
 */
export async function fetchVersesFromApiBible(
  bibleId: string,
  bookName: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number
): Promise<{ verse: number; text: string }[]> {
  
  // Handle Bolls.life translations (prefixed with "bolls:")
  if (isBollsTranslation(bibleId)) {
    const bollsId = getBollsTranslationCode(bibleId);
    const result = await fetchBollsChapter(bookName, chapter, bollsId);
    if (result) {
      // Filter to the requested verse range
      const endVerse = verseEnd || verseStart;
      return result.verses.filter(v => v.verse >= verseStart && v.verse <= endVerse);
    }
    return [];
  }

  // Handle API.Bible translations
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("API_BIBLE_KEY not set");
    return [];
  }

  const bookId = getBookId(bookName);
  if (!bookId) {
    console.error("Unknown book:", bookName);
    return [];
  }

  const verseId = verseEnd 
    ? `${bookId}.${chapter}.${verseStart}-${bookId}.${chapter}.${verseEnd}`
    : `${bookId}.${chapter}.${verseStart}`;

  try {
    const response = await fetch(
      `${API_BIBLE_BASE}/bibles/${bibleId}/verses/${verseId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false`,
      {
        headers: {
          "api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error("API.Bible verse error:", response.status);
      return [];
    }

    const data = await response.json();
    const content = data.data?.content || "";

    // For single verse
    if (!verseEnd) {
      return [{ verse: verseStart, text: content.trim() }];
    }

    // For verse range, parse the content
    return parseVersesFromContent(content);
  } catch (error) {
    console.error("API.Bible verse fetch error:", error);
    return [];
  }
}

/**
 * Parse verses from API.Bible content
 * Content comes with verse markers like [1], [2], etc.
 */
function parseVersesFromContent(content: string): { verse: number; text: string }[] {
  const verses: { verse: number; text: string }[] = [];
  
  // Clean HTML tags if present
  const cleanContent = content
    .replace(/<[^>]+>/g, "")
    .replace(/\n+/g, " ")
    .trim();

  // Match verse patterns: [1] text [2] text...
  const versePattern = /\[(\d+)\]\s*([^[\]]+)/g;
  let match;

  while ((match = versePattern.exec(cleanContent)) !== null) {
    const verseNum = parseInt(match[1]);
    const text = match[2].trim();
    if (text) {
      verses.push({ verse: verseNum, text });
    }
  }

  // If no verses found with brackets, try without (single verse case)
  if (verses.length === 0 && cleanContent) {
    verses.push({ verse: 1, text: cleanContent });
  }

  return verses;
}

/**
 * Search the Bible using API.Bible
 */
export async function searchApiBible(
  bibleId: string,
  query: string,
  limit: number = 20
): Promise<{ reference: string; text: string }[]> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("API_BIBLE_KEY not set");
    return [];
  }

  try {
    const response = await fetch(
      `${API_BIBLE_BASE}/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          "api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error("API.Bible search error:", response.status);
      return [];
    }

    const data = await response.json();
    const verses = data.data?.verses || [];

    return verses.map((v: any) => ({
      reference: v.reference,
      text: v.text?.replace(/<[^>]+>/g, "").trim() || "",
    }));
  } catch (error) {
    console.error("API.Bible search error:", error);
    return [];
  }
}

/**
 * Convert app locale to API.Bible language code
 */
export function getApiLanguageCode(locale: string): string {
  return LOCALE_TO_API_LANG[locale] || "eng";
}

/**
 * Get list of available Bibles from API.Bible
 * @param locale - App locale code (en, es, de, etc.) - will be converted to API.Bible language code
 */
export async function getAvailableBibles(locale?: string): Promise<{ id: string; name: string; abbreviation: string; language: string }[]> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("API_BIBLE_KEY not set");
    return [];
  }

  try {
    // Convert app locale to API.Bible language code
    const apiLang = locale ? getApiLanguageCode(locale) : undefined;
    const url = apiLang 
      ? `${API_BIBLE_BASE}/bibles?language=${apiLang}`
      : `${API_BIBLE_BASE}/bibles`;

    const response = await fetch(url, {
      headers: {
        "api-key": apiKey,
      },
    });

    if (!response.ok) {
      console.error("API.Bible list error:", response.status);
      return [];
    }

    const data = await response.json();
    const bibles = data.data || [];

    return bibles.map((b: any) => ({
      id: b.id,
      name: b.name,
      abbreviation: b.abbreviation || b.name.substring(0, 3).toUpperCase(),
      language: b.language?.id || "eng",
    }));
  } catch (error) {
    console.error("API.Bible list error:", error);
    return [];
  }
}
