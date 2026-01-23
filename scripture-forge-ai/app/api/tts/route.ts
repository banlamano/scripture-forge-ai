import { NextRequest, NextResponse } from "next/server";

// Language to voice mapping for natural TTS
// Using ResponsiveVoice compatible voices (works via API)
const LANGUAGE_VOICES: Record<string, string> = {
  en: "Brian", // English - natural male voice
  es: "Enrique", // Spanish
  fr: "Mathieu", // French
  de: "Hans", // German
  it: "Giorgio", // Italian
  pt: "Ricardo", // Portuguese
  zh: "Zhiyu", // Chinese
  ja: "Takumi", // Japanese
  ko: "Seoyeon", // Korean
  nl: "Ruben", // Dutch
  pl: "Jacek", // Polish
  ru: "Maxim", // Russian
  ar: "Zeina", // Arabic
  hi: "Aditi", // Hindi
  tr: "Filiz", // Turkish
};

// Split text into chunks (API has character limits)
function splitTextIntoChunks(text: string, maxLength: number = 500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  return chunks;
}

export async function POST(request: NextRequest) {
  try {
    const { text, language = "en" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Use StreamElements TTS API (free, no key required)
    const voice = LANGUAGE_VOICES[language] || LANGUAGE_VOICES["en"];
    
    // Split text into manageable chunks
    const chunks = splitTextIntoChunks(text, 500);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const encodedText = encodeURIComponent(chunk);
      const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${voice}&text=${encodedText}`;

      const response = await fetch(ttsUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        console.error("StreamElements TTS error:", response.status);
        // Try fallback with English voice
        if (voice !== "Brian") {
          const fallbackUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodedText}`;
          const fallbackResponse = await fetch(fallbackUrl);
          if (fallbackResponse.ok) {
            const buffer = await fallbackResponse.arrayBuffer();
            audioBuffers.push(Buffer.from(buffer));
            continue;
          }
        }
        continue; // Skip this chunk if both fail
      }

      const buffer = await response.arrayBuffer();
      audioBuffers.push(Buffer.from(buffer));
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate audio" },
        { status: 500 }
      );
    }

    // Combine all audio buffers
    const combinedBuffer = Buffer.concat(audioBuffers);
    const base64Audio = combinedBuffer.toString("base64");

    return NextResponse.json({
      audioContent: base64Audio,
      contentType: "audio/mpeg",
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "TTS service error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "en";

  return NextResponse.json({
    language,
    voice: LANGUAGE_VOICES[language] || LANGUAGE_VOICES["en"],
    supported: !!LANGUAGE_VOICES[language],
    provider: "StreamElements TTS (Free)",
  });
}
