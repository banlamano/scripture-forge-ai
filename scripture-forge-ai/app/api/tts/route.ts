import { NextRequest, NextResponse } from "next/server";

// Language code mapping for Google Translate TTS
const LANGUAGE_CODES: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  zh: "zh-CN",
  ja: "ja",
  ko: "ko",
  nl: "nl",
  pl: "pl",
  ru: "ru",
  ar: "ar",
  hi: "hi",
  tr: "tr",
  vi: "vi",
  th: "th",
  id: "id",
  sw: "sw",
};

// Split text into chunks (Google TTS has ~200 char limit per request)
function splitTextIntoChunks(text: string, maxLength: number = 180): string[] {
  // Split by sentences first
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if ((currentChunk + " " + trimmedSentence).length <= maxLength) {
      currentChunk = currentChunk ? currentChunk + " " + trimmedSentence : trimmedSentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      // If single sentence is too long, split by words
      if (trimmedSentence.length > maxLength) {
        const words = trimmedSentence.split(/\s+/);
        let wordChunk = "";
        for (const word of words) {
          if ((wordChunk + " " + word).length <= maxLength) {
            wordChunk = wordChunk ? wordChunk + " " + word : word;
          } else {
            if (wordChunk) chunks.push(wordChunk.trim());
            wordChunk = word;
          }
        }
        if (wordChunk) currentChunk = wordChunk;
      } else {
        currentChunk = trimmedSentence;
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks.filter(c => c.length > 0);
}

export async function POST(request: NextRequest) {
  try {
    const { text, language = "en" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const langCode = LANGUAGE_CODES[language] || "en";
    
    // Split text into chunks
    const chunks = splitTextIntoChunks(text, 180);
    const audioBuffers: Buffer[] = [];

    console.log(`TTS: Processing ${chunks.length} chunks for language: ${langCode}`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const encodedText = encodeURIComponent(chunk);
      
      // Use Google Translate TTS (free, no API key)
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodedText}`;

      try {
        const response = await fetch(ttsUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://translate.google.com/",
          },
        });

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          audioBuffers.push(Buffer.from(buffer));
        } else {
          console.error(`TTS chunk ${i} failed:`, response.status);
        }
      } catch (chunkError) {
        console.error(`TTS chunk ${i} error:`, chunkError);
      }
      
      // Small delay between requests to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate audio. Please try again." },
        { status: 500 }
      );
    }

    // Combine all audio buffers
    const combinedBuffer = Buffer.concat(audioBuffers);
    const base64Audio = combinedBuffer.toString("base64");

    console.log(`TTS: Generated ${audioBuffers.length}/${chunks.length} chunks, total size: ${combinedBuffer.length} bytes`);

    return NextResponse.json({
      audioContent: base64Audio,
      contentType: "audio/mpeg",
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "TTS service error. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "en";

  return NextResponse.json({
    language,
    langCode: LANGUAGE_CODES[language] || "en",
    supported: !!LANGUAGE_CODES[language],
    provider: "Google Translate TTS (Free)",
  });
}
