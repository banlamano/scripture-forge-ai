/**
 * Bolls.life Bible API Integration
 * Free API with multiple translations including French, German, Spanish, etc.
 * Documentation: https://bolls.life/api/
 */

const BOLLS_API_BASE = "https://bolls.life";

// Book name to bolls.life book ID mapping (1-66)
const BOOK_NAME_TO_ID: Record<string, number> = {
  // Old Testament
  "Genesis": 1, "Gen": 1,
  "Exodus": 2, "Exod": 2, "Ex": 2,
  "Leviticus": 3, "Lev": 3,
  "Numbers": 4, "Num": 4,
  "Deuteronomy": 5, "Deut": 5, "Dt": 5,
  "Joshua": 6, "Josh": 6,
  "Judges": 7, "Judg": 7, "Jdg": 7,
  "Ruth": 8,
  "1 Samuel": 9, "1Samuel": 9, "1Sam": 9, "1 Sam": 9,
  "2 Samuel": 10, "2Samuel": 10, "2Sam": 10, "2 Sam": 10,
  "1 Kings": 11, "1Kings": 11, "1Kgs": 11, "1 Kgs": 11,
  "2 Kings": 12, "2Kings": 12, "2Kgs": 12, "2 Kgs": 12,
  "1 Chronicles": 13, "1Chronicles": 13, "1Chr": 13, "1 Chr": 13,
  "2 Chronicles": 14, "2Chronicles": 14, "2Chr": 14, "2 Chr": 14,
  "Ezra": 15,
  "Nehemiah": 16, "Neh": 16,
  "Esther": 17, "Esth": 17, "Est": 17,
  "Job": 18,
  "Psalms": 19, "Psalm": 19, "Ps": 19, "Psa": 19,
  "Proverbs": 20, "Prov": 20, "Pro": 20,
  "Ecclesiastes": 21, "Eccl": 21, "Ecc": 21,
  "Song of Solomon": 22, "Song": 22, "SoS": 22, "Songs": 22, "Canticles": 22,
  "Isaiah": 23, "Isa": 23, "Is": 23,
  "Jeremiah": 24, "Jer": 24,
  "Lamentations": 25, "Lam": 25,
  "Ezekiel": 26, "Ezek": 26, "Eze": 26,
  "Daniel": 27, "Dan": 27,
  "Hosea": 28, "Hos": 28,
  "Joel": 29,
  "Amos": 30,
  "Obadiah": 31, "Obad": 31, "Oba": 31,
  "Jonah": 32, "Jon": 32,
  "Micah": 33, "Mic": 33,
  "Nahum": 34, "Nah": 34,
  "Habakkuk": 35, "Hab": 35,
  "Zephaniah": 36, "Zeph": 36, "Zep": 36,
  "Haggai": 37, "Hag": 37,
  "Zechariah": 38, "Zech": 38, "Zec": 38,
  "Malachi": 39, "Mal": 39,
  // New Testament
  "Matthew": 40, "Matt": 40, "Mt": 40,
  "Mark": 41, "Mk": 41,
  "Luke": 42, "Lk": 42,
  "John": 43, "Jn": 43,
  "Acts": 44, "Act": 44,
  "Romans": 45, "Rom": 45,
  "1 Corinthians": 46, "1Corinthians": 46, "1Cor": 46, "1 Cor": 46,
  "2 Corinthians": 47, "2Corinthians": 47, "2Cor": 47, "2 Cor": 47,
  "Galatians": 48, "Gal": 48,
  "Ephesians": 49, "Eph": 49,
  "Philippians": 50, "Phil": 50, "Php": 50,
  "Colossians": 51, "Col": 51,
  "1 Thessalonians": 52, "1Thessalonians": 52, "1Thess": 52, "1 Thess": 52,
  "2 Thessalonians": 53, "2Thessalonians": 53, "2Thess": 53, "2 Thess": 53,
  "1 Timothy": 54, "1Timothy": 54, "1Tim": 54, "1 Tim": 54,
  "2 Timothy": 55, "2Timothy": 55, "2Tim": 55, "2 Tim": 55,
  "Titus": 56, "Tit": 56,
  "Philemon": 57, "Phlm": 57, "Phm": 57,
  "Hebrews": 58, "Heb": 58,
  "James": 59, "Jas": 59,
  "1 Peter": 60, "1Peter": 60, "1Pet": 60, "1 Pet": 60,
  "2 Peter": 61, "2Peter": 61, "2Pet": 61, "2 Pet": 61,
  "1 John": 62, "1John": 62, "1Jn": 62, "1 Jn": 62,
  "2 John": 63, "2John": 63, "2Jn": 63, "2 Jn": 63,
  "3 John": 64, "3John": 64, "3Jn": 64, "3 Jn": 64,
  "Jude": 65,
  "Revelation": 66, "Rev": 66, "Re": 66,
};

// Reverse mapping: book ID to canonical name
const BOOK_ID_TO_NAME: Record<number, string> = {
  1: "Genesis", 2: "Exodus", 3: "Leviticus", 4: "Numbers", 5: "Deuteronomy",
  6: "Joshua", 7: "Judges", 8: "Ruth", 9: "1 Samuel", 10: "2 Samuel",
  11: "1 Kings", 12: "2 Kings", 13: "1 Chronicles", 14: "2 Chronicles",
  15: "Ezra", 16: "Nehemiah", 17: "Esther", 18: "Job", 19: "Psalms",
  20: "Proverbs", 21: "Ecclesiastes", 22: "Song of Solomon", 23: "Isaiah",
  24: "Jeremiah", 25: "Lamentations", 26: "Ezekiel", 27: "Daniel",
  28: "Hosea", 29: "Joel", 30: "Amos", 31: "Obadiah", 32: "Jonah",
  33: "Micah", 34: "Nahum", 35: "Habakkuk", 36: "Zephaniah", 37: "Haggai",
  38: "Zechariah", 39: "Malachi", 40: "Matthew", 41: "Mark", 42: "Luke",
  43: "John", 44: "Acts", 45: "Romans", 46: "1 Corinthians", 47: "2 Corinthians",
  48: "Galatians", 49: "Ephesians", 50: "Philippians", 51: "Colossians",
  52: "1 Thessalonians", 53: "2 Thessalonians", 54: "1 Timothy", 55: "2 Timothy",
  56: "Titus", 57: "Philemon", 58: "Hebrews", 59: "James", 60: "1 Peter",
  61: "2 Peter", 62: "1 John", 63: "2 John", 64: "3 John", 65: "Jude",
  66: "Revelation",
};

// Available translations by language on bolls.life
// Translation codes verified from https://bolls.life/static/bolls/app/views/languages.json
export const BOLLS_TRANSLATIONS: Record<string, { id: string; name: string; abbreviation: string }[]> = {
  fr: [
    { id: "FRLSG", name: "Louis Segond 1910", abbreviation: "LSG" },
    { id: "NBS", name: "Nouvelle Bible Segond 2002", abbreviation: "NBS" },
    { id: "FRDBY", name: "Bible de Darby 1890", abbreviation: "DBY" },
    { id: "FRPDV17", name: "Parole de Vie 2017", abbreviation: "PDV" },
  ],
  de: [
    { id: "LUT", name: "Luther 1912", abbreviation: "LUT" },
    { id: "SCH", name: "Schlachter 1951", abbreviation: "SCH" },
    { id: "ELB", name: "Elberfelder Bibel 1871", abbreviation: "ELB" },
    { id: "S00", name: "Schlachter 2000", abbreviation: "S00" },
    { id: "MB", name: "Menge-Bibel", abbreviation: "MB" },
  ],
  es: [
    { id: "RV1960", name: "Reina Valera 1960", abbreviation: "RV60" },
    { id: "NVI", name: "Nueva Versión Internacional", abbreviation: "NVI" },
    { id: "NTV", name: "Nueva Traducción Viviente", abbreviation: "NTV" },
    { id: "LBLA", name: "La Biblia de las Américas", abbreviation: "LBLA" },
  ],
  pt: [
    { id: "ARA", name: "Almeida Revista e Atualizada 1993", abbreviation: "ARA" },
    { id: "NTLH", name: "Nova Tradução na Linguagem de Hoje", abbreviation: "NTLH" },
    { id: "NAA", name: "Nova Almeida Atualizada 2017", abbreviation: "NAA" },
    { id: "NVT", name: "Nova Versão Transformadora 2016", abbreviation: "NVT" },
  ],
  en: [
    { id: "YLT", name: "Young's Literal Translation", abbreviation: "YLT" },
    { id: "WEB", name: "World English Bible", abbreviation: "WEB" },
    { id: "KJV", name: "King James Version", abbreviation: "KJV" },
  ],
  it: [
    { id: "NR2006", name: "Nuova Riveduta 2006", abbreviation: "NR06" },
    { id: "NR1994", name: "Nuova Riveduta 1994", abbreviation: "NR94" },
    { id: "CEI2008", name: "Conferenza Episcopale Italiana 2008", abbreviation: "CEI" },
    { id: "TILC", name: "Traduzione in Lingua Corrente", abbreviation: "TILC" },
  ],
};

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
 * Get the canonical book name from a book ID
 */
export function getBookName(bookId: number): string | null {
  return BOOK_ID_TO_NAME[bookId] || null;
}

/**
 * Check if bolls.life has translations for a given language
 */
export function hasBollsTranslation(locale: string): boolean {
  return locale in BOLLS_TRANSLATIONS && BOLLS_TRANSLATIONS[locale].length > 0;
}

/**
 * Get the default translation ID for a language
 */
export function getDefaultBollsTranslation(locale: string): string | null {
  const translations = BOLLS_TRANSLATIONS[locale];
  if (translations && translations.length > 0) {
    return translations[0].id;
  }
  return null;
}

/**
 * Get available translations for a language from bolls.life
 */
export function getBollsTranslations(locale: string): { id: string; name: string; abbreviation: string }[] {
  return BOLLS_TRANSLATIONS[locale] || [];
}

export interface BollsVerse {
  pk: number;
  verse: number;
  text: string;
}

export interface BollsChapterResult {
  book: string;
  chapter: number;
  translation: string;
  verses: { verse: number; text: string }[];
}

/**
 * Fetch a chapter from bolls.life
 */
export async function fetchBollsChapter(
  bookName: string,
  chapter: number,
  translationId: string
): Promise<BollsChapterResult | null> {
  const bookId = getBookId(bookName);
  if (!bookId) {
    console.error(`Unknown book: ${bookName}`);
    return null;
  }

  try {
    const url = `${BOLLS_API_BASE}/get-chapter/${translationId}/${bookId}/${chapter}/`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Bolls.life API error: ${response.status} for ${url}`);
      return null;
    }

    const data: BollsVerse[] = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    // Clean HTML tags from verse text
    const cleanText = (text: string) => {
      return text
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .trim();
    };

    return {
      book: getBookName(bookId) || bookName,
      chapter,
      translation: translationId,
      verses: data.map((v) => ({
        verse: v.verse,
        text: cleanText(v.text),
      })),
    };
  } catch (error) {
    console.error("Bolls.life fetch error:", error);
    return null;
  }
}

/**
 * Fetch a specific verse from bolls.life
 */
export async function fetchBollsVerse(
  bookName: string,
  chapter: number,
  verse: number,
  translationId: string
): Promise<{ verse: number; text: string } | null> {
  const result = await fetchBollsChapter(bookName, chapter, translationId);
  if (!result) {
    return null;
  }

  const verseData = result.verses.find((v) => v.verse === verse);
  return verseData || null;
}

/**
 * Get list of books available in a translation
 */
export async function fetchBollsBooks(
  translationId: string
): Promise<{ bookId: number; name: string; chapters: number }[] | null> {
  try {
    const url = `${BOLLS_API_BASE}/get-books/${translationId}/`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Bolls.life books error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.map((book: { bookid: number; name: string; chapters: number }) => ({
      bookId: book.bookid,
      name: book.name,
      chapters: book.chapters,
    }));
  } catch (error) {
    console.error("Bolls.life books fetch error:", error);
    return null;
  }
}
