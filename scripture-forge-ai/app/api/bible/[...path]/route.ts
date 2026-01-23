import { NextRequest, NextResponse } from "next/server";
import { fetchChapter, fetchVerses, searchVerses } from "@/lib/bible-api";
import { 
  fetchChapterFromApiBible, 
  getDefaultBibleId, 
  getTranslationsForLanguage,
  BIBLE_TRANSLATIONS,
  isBollsTranslation
} from "@/lib/api-bible";
import { searchBollsBible } from "@/lib/bolls-bible";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const [action, ...rest] = path;
    const searchParams = request.nextUrl.searchParams;
    const translation = searchParams.get("translation") || "kjv";
    const targetLang = searchParams.get("lang") || "en"; // Target language for native translations
    const bibleId = searchParams.get("bibleId"); // Specific Bible ID from API.Bible

    switch (action) {
      case "chapter": {
        const [book, chapterStr] = rest;
        const chapter = parseInt(chapterStr);
        
        if (!book || isNaN(chapter)) {
          return NextResponse.json(
            { error: "Invalid book or chapter" },
            { status: 400 }
          );
        }

        // Get the Bible ID to use
        const apiBibleId = bibleId || getDefaultBibleId(targetLang);
        
        // Check if this is a Bolls.life translation (doesn't need API key)
        // or if we have an API.Bible key configured
        const canUseBibleApi = isBollsTranslation(apiBibleId) || process.env.API_BIBLE_KEY;
        
        if (canUseBibleApi) {
          try {
            const apiBibleData = await fetchChapterFromApiBible(apiBibleId, book, chapter);
            
            if (apiBibleData && apiBibleData.verses.length > 0) {
              // Find translation name from our known translations
              const allTranslations = Object.values(BIBLE_TRANSLATIONS).flat();
              const translationInfo = allTranslations.find(t => t.id === apiBibleId);
              
              return NextResponse.json({
                book: apiBibleData.book,
                chapter: apiBibleData.chapter,
                translation: translationInfo?.abbreviation || apiBibleId,
                translationName: translationInfo?.name || "Bible Translation",
                verses: apiBibleData.verses,
                isNativeTranslation: true,
                language: targetLang,
              });
            }
          } catch (apiBibleError) {
            console.error("Bible API failed, falling back:", apiBibleError);
            // Fall through to original API
          }
        }

        // Fallback to original bible-api.com (English only)
        const data = await fetchChapter(book, chapter, translation);
        
        if (!data) {
          return NextResponse.json(
            { error: "Chapter not found" },
            { status: 404 }
          );
        }

        return NextResponse.json(data);
      }

      case "verse": {
        // Support multiple URL formats:
        // /api/bible/verse/John/3/16 -> "John 3:16"
        // /api/bible/verse/John/3/16-18 -> "John 3:16-18"
        // /api/bible/verse/1%20John/4/7 -> "1 John 4:7"
        // Also support URL-encoded full reference: /api/bible/verse/John%203:16
        
        if (rest.length === 0) {
          return NextResponse.json(
            { error: "Reference required" },
            { status: 400 }
          );
        }

        let reference: string;
        
        if (rest.length >= 3) {
          // Format: /verse/Book/Chapter/Verse or /verse/Book/Chapter/VerseStart-VerseEnd
          const book = rest.slice(0, -2).join(" "); // Handle multi-word books like "1 John"
          const chapter = rest[rest.length - 2];
          const verse = rest[rest.length - 1];
          reference = `${book} ${chapter}:${verse}`;
        } else if (rest.length === 2) {
          // Format: /verse/Book/Chapter (entire chapter)
          const book = rest[0];
          const chapter = rest[1];
          reference = `${book} ${chapter}`;
        } else {
          // Format: /verse/EncodedReference (e.g., "John%203:16")
          reference = decodeURIComponent(rest[0]);
        }

        const verses = await fetchVerses(reference, translation);
        return NextResponse.json({ verses });
      }

      case "search": {
        const query = searchParams.get("q");
        const filter = searchParams.get("filter") || "all"; // all, ot, nt, or book name
        const translationForSearch = searchParams.get("translation") || "KJV";
        
        if (!query) {
          return NextResponse.json(
            { error: "Search query required" },
            { status: 400 }
          );
        }

        // Use Bolls.life API for comprehensive search
        const searchResponse = await searchBollsBible(query, translationForSearch);
        
        // Apply filter
        let filteredResults = searchResponse.results;
        if (filter === "ot") {
          filteredResults = searchResponse.results.filter(r => r.testament === "OT");
        } else if (filter === "nt") {
          filteredResults = searchResponse.results.filter(r => r.testament === "NT");
        } else if (filter !== "all") {
          // Filter by specific book
          filteredResults = searchResponse.results.filter(
            r => r.book.toLowerCase() === filter.toLowerCase()
          );
        }

        return NextResponse.json({
          results: filteredResults,
          totalCount: searchResponse.totalCount,
          otCount: searchResponse.otCount,
          ntCount: searchResponse.ntCount,
          bookCounts: searchResponse.bookCounts,
          filter,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid endpoint" },
          { status: 404 }
        );
    }
  } catch (error) {
    console.error("Bible API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
