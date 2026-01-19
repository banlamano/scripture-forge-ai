/**
 * Bible API Integration
 * Handles fetching Bible content from various sources
 */

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

export interface BibleChapter {
  book: string;
  chapter: number;
  translation: string;
  verses: BibleVerse[];
}

// Public domain KJV data can be fetched from various APIs
const BIBLE_API_BASE = "https://bible-api.com";

// Books with only one chapter - these need special handling
const SINGLE_CHAPTER_BOOKS: Record<string, number> = {
  "Obadiah": 21,
  "Philemon": 25,
  "2 John": 13,
  "3 John": 14,
  "Jude": 25,
};

/**
 * Check if a book has only one chapter and return verse count
 */
function getSingleChapterVerseCount(book: string): number | null {
  const normalizedBook = book.trim();
  return SINGLE_CHAPTER_BOOKS[normalizedBook] || null;
}

/**
 * Fetch a specific verse or range
 */
export async function fetchVerses(
  reference: string,
  translation: string = "kjv"
): Promise<BibleVerse[]> {
  try {
    const response = await fetch(
      `${BIBLE_API_BASE}/${encodeURIComponent(reference)}?translation=${translation}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch verses");
    }

    const data = await response.json();
    
    return data.verses.map((v: any) => ({
      book: v.book_name,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      translation,
    }));
  } catch (error) {
    console.error("Bible API error:", error);
    return [];
  }
}

/**
 * Fetch an entire chapter
 */
export async function fetchChapter(
  book: string,
  chapter: number,
  translation: string = "kjv"
): Promise<BibleChapter | null> {
  try {
    // Check if this is a single-chapter book
    const singleChapterVerseCount = getSingleChapterVerseCount(book);
    
    let reference: string;
    if (singleChapterVerseCount && chapter === 1) {
      // For single-chapter books, we need to specify the full verse range
      // because "Jude 1" is interpreted as "Jude 1:1" by the API
      reference = `${book} 1:1-${singleChapterVerseCount}`;
    } else {
      reference = `${book} ${chapter}`;
    }
    
    const verses = await fetchVerses(reference, translation);
    
    if (verses.length === 0) return null;
    
    return {
      book,
      chapter,
      translation,
      verses,
    };
  } catch (error) {
    console.error("Failed to fetch chapter:", error);
    return null;
  }
}

/**
 * Search verses by keyword
 * Uses Bible-API.com which supports searching by reference
 * For keyword search, we search across popular books and filter results
 */
export async function searchVerses(
  query: string,
  translation: string = "kjv",
  limit: number = 20
): Promise<BibleVerse[]> {
  try {
    // Check if query looks like a Bible reference (e.g., "John 3:16", "Romans 8")
    const referenceMatch = query.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?/i);
    
    if (referenceMatch) {
      // It's a reference - fetch directly
      const verses = await fetchVerses(query, translation);
      return verses.slice(0, limit);
    }

    // For keyword search, search through key passages that commonly contain the keyword
    // This is a practical approach since bible-api.com doesn't have full-text search
    const searchableReferences = getSearchableReferences(query.toLowerCase());
    
    const allResults: BibleVerse[] = [];
    const queryLower = query.toLowerCase();
    
    // Fetch verses from relevant passages and filter by keyword
    for (const ref of searchableReferences) {
      if (allResults.length >= limit) break;
      
      try {
        const verses = await fetchVerses(ref, translation);
        const matches = verses.filter(v => 
          v.text.toLowerCase().includes(queryLower)
        );
        allResults.push(...matches);
      } catch {
        // Skip failed fetches
      }
    }

    return allResults.slice(0, limit);
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

/**
 * Get references to search based on common Bible themes/keywords
 */
function getSearchableReferences(keyword: string): string[] {
  // Map common keywords to relevant Bible passages
  const keywordMap: Record<string, string[]> = {
    love: [
      "1 Corinthians 13", "John 3:16-17", "1 John 4:7-21", "Romans 8:35-39",
      "John 15:9-17", "Ephesians 5:25-33", "Song of Solomon 8:6-7"
    ],
    faith: [
      "Hebrews 11", "Romans 10:17", "James 2:14-26", "Ephesians 2:8-9",
      "Mark 11:22-24", "Matthew 17:20", "Galatians 2:20"
    ],
    hope: [
      "Romans 15:13", "Hebrews 6:19", "1 Peter 1:3-9", "Romans 8:24-25",
      "Jeremiah 29:11", "Psalm 42", "Lamentations 3:21-26"
    ],
    peace: [
      "John 14:27", "Philippians 4:6-7", "Isaiah 26:3", "Romans 5:1",
      "Colossians 3:15", "Psalm 29:11", "Numbers 6:24-26"
    ],
    joy: [
      "Philippians 4:4-7", "Nehemiah 8:10", "Psalm 16:11", "Romans 15:13",
      "John 15:11", "Galatians 5:22-23", "James 1:2-4"
    ],
    salvation: [
      "Romans 10:9-13", "Ephesians 2:8-9", "John 3:16-17", "Acts 4:12",
      "Titus 3:4-7", "Romans 6:23", "2 Corinthians 5:17"
    ],
    forgiveness: [
      "1 John 1:9", "Ephesians 4:32", "Colossians 3:13", "Matthew 6:14-15",
      "Psalm 103:10-12", "Isaiah 1:18", "Acts 3:19"
    ],
    strength: [
      "Philippians 4:13", "Isaiah 40:29-31", "2 Corinthians 12:9-10",
      "Psalm 46:1", "Nehemiah 8:10", "Deuteronomy 31:6", "Joshua 1:9"
    ],
    wisdom: [
      "Proverbs 1", "Proverbs 2", "Proverbs 3", "James 1:5",
      "Proverbs 9:10", "Colossians 2:2-3", "1 Corinthians 1:30"
    ],
    fear: [
      "Isaiah 41:10", "2 Timothy 1:7", "Psalm 23", "Psalm 91",
      "Joshua 1:9", "Psalm 27:1", "Romans 8:15"
    ],
    prayer: [
      "Matthew 6:9-13", "Philippians 4:6-7", "1 Thessalonians 5:16-18",
      "James 5:13-16", "John 14:13-14", "Romans 8:26-27", "Psalm 145"
    ],
    grace: [
      "Ephesians 2:8-9", "2 Corinthians 12:9", "Romans 5:20-21",
      "Titus 2:11-14", "John 1:14-17", "Romans 6:14", "Hebrews 4:16"
    ],
    truth: [
      "John 14:6", "John 8:32", "John 17:17", "Psalm 119:160",
      "Ephesians 4:15", "3 John 1:4", "Proverbs 12:19"
    ],
    light: [
      "John 8:12", "Matthew 5:14-16", "Psalm 119:105", "1 John 1:5-7",
      "Isaiah 60:1-3", "John 1:1-9", "Ephesians 5:8-14"
    ],
    life: [
      "John 10:10", "John 14:6", "John 11:25-26", "Romans 6:23",
      "Galatians 2:20", "Colossians 3:1-4", "John 3:16"
    ],
    death: [
      "Romans 6:23", "1 Corinthians 15:54-57", "Hebrews 2:14-15",
      "Revelation 21:4", "Psalm 23:4", "John 11:25-26", "Romans 8:38-39"
    ],
    sin: [
      "Romans 3:23", "Romans 6:23", "1 John 1:8-10", "Isaiah 53:5-6",
      "Romans 5:12", "James 1:15", "Psalm 51"
    ],
    heaven: [
      "John 14:1-3", "Revelation 21:1-7", "Philippians 3:20-21",
      "2 Corinthians 5:1-8", "1 Thessalonians 4:16-17", "Revelation 22:1-5"
    ],
    blessed: [
      "Matthew 5:1-12", "Psalm 1", "Psalm 32:1-2", "James 1:12",
      "Romans 4:7-8", "Revelation 22:14", "Proverbs 3:13"
    ],
    lord: [
      "Psalm 23", "Psalm 100", "Philippians 2:9-11", "Romans 10:9-13",
      "Acts 2:36", "1 Corinthians 12:3", "Revelation 19:16"
    ],
  };

  // Check if the keyword matches any mapped terms
  for (const [key, refs] of Object.entries(keywordMap)) {
    if (keyword.includes(key) || key.includes(keyword)) {
      return refs;
    }
  }

  // Default: search popular/important chapters that cover many topics
  return [
    "Psalm 23", "Psalm 91", "Psalm 119:1-32", "Proverbs 3",
    "Matthew 5", "Matthew 6", "John 1", "John 3",
    "Romans 8", "1 Corinthians 13", "Philippians 4",
    "Hebrews 11", "James 1", "1 John 4"
  ];
}

/**
 * Get verse of the day
 * Returns a curated inspiring verse
 */
export async function getVerseOfTheDay(): Promise<BibleVerse | null> {
  const inspiringVerses = [
    "John 3:16",
    "Jeremiah 29:11",
    "Philippians 4:13",
    "Romans 8:28",
    "Proverbs 3:5-6",
    "Isaiah 41:10",
    "Psalm 23:1",
    "Matthew 11:28",
    "Joshua 1:9",
    "Psalm 46:1",
  ];

  // Use date to deterministically select verse
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const verseIndex = dayOfYear % inspiringVerses.length;
  const reference = inspiringVerses[verseIndex];

  const verses = await fetchVerses(reference);
  return verses[0] || null;
}

/**
 * Parse a verse reference string
 */
export function parseReference(reference: string): {
  book: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
} | null {
  // Match patterns like "John 3:16", "1 John 4:7-8", "Genesis 1"
  const match = reference.match(
    /^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/
  );

  if (!match) return null;

  return {
    book: match[1].trim(),
    chapter: parseInt(match[2]),
    verseStart: match[3] ? parseInt(match[3]) : undefined,
    verseEnd: match[4] ? parseInt(match[4]) : undefined,
  };
}

/**
 * Format a verse reference for display
 */
export function formatReference(
  book: string,
  chapter: number,
  verseStart?: number,
  verseEnd?: number
): string {
  let ref = `${book} ${chapter}`;
  if (verseStart) {
    ref += `:${verseStart}`;
    if (verseEnd && verseEnd !== verseStart) {
      ref += `-${verseEnd}`;
    }
  }
  return ref;
}
