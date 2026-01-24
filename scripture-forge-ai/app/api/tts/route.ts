import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// OpenAI TTS voices - all sound natural
// alloy, echo, fable, onyx, nova, shimmer
const VOICE_OPTIONS = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type Voice = typeof VOICE_OPTIONS[number];

// Default voices per language style (OpenAI voices work for all languages)
const LANGUAGE_VOICE_MAP: Record<string, Voice> = {
  en: "onyx",    // Deep, authoritative - good for scripture
  es: "nova",    // Warm, clear
  fr: "nova",    // Warm, clear
  de: "onyx",    // Deep, authoritative
  it: "nova",    // Warm, expressive
  pt: "nova",    // Warm, clear
  zh: "nova",    // Clear
  ja: "nova",    // Clear
  ko: "nova",    // Clear
  nl: "onyx",    // Clear
  pl: "onyx",    // Clear
  ru: "onyx",    // Deep
  ar: "onyx",    // Deep, clear
  hi: "nova",    // Warm
  tr: "nova",    // Clear
  vi: "nova",    // Clear
  th: "nova",    // Clear
  id: "nova",    // Clear
  sw: "nova",    // Clear
};

export async function POST(request: NextRequest) {
  try {
    const { text, language = "en" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not configured - returning fallback flag");
      return NextResponse.json(
        { error: "TTS not configured", useFallback: true },
        { status: 503 }
      );
    }

    // Limit text length (OpenAI TTS has 4096 char limit)
    const maxLength = 4000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    // Get voice for language
    const voice = LANGUAGE_VOICE_MAP[language] || "onyx";

    console.log(`TTS: Generating audio with OpenAI, voice: ${voice}, text length: ${truncatedText.length}`);

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey });

    // Generate speech using OpenAI TTS
    const response = await openai.audio.speech.create({
      model: "tts-1",  // Use "tts-1-hd" for higher quality (slower, more expensive)
      voice: voice,
      input: truncatedText,
      speed: 0.95, // Slightly slower for scripture reading
    });

    // Get the audio as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    console.log(`TTS: Generated audio, size: ${audioBuffer.byteLength} bytes`);

    return NextResponse.json({
      audioContent: base64Audio,
      contentType: "audio/mpeg",
    });
  } catch (error) {
    console.error("TTS error:", error);
    
    // Provide more specific error messages and fallback flags
    if (error instanceof Error) {
      // Quota exceeded - use fallback
      if (error.message.includes("quota") || error.message.includes("insufficient_quota")) {
        console.log("OpenAI quota exceeded, returning fallback flag");
        return NextResponse.json(
          { error: "TTS quota exceeded", useFallback: true },
          { status: 503 }
        );
      }
      // API key issues
      if (error.message.includes("API key") || error.message.includes("authentication")) {
        return NextResponse.json(
          { error: "TTS service authentication failed", useFallback: true },
          { status: 503 }
        );
      }
      // Rate limit
      if (error.message.includes("rate limit") || error.message.includes("429")) {
        return NextResponse.json(
          { error: "TTS service is busy", useFallback: true },
          { status: 503 }
        );
      }
    }
    
    // Any other error - use fallback
    return NextResponse.json(
      { error: "TTS service unavailable", useFallback: true },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "en";

  return NextResponse.json({
    language,
    voice: LANGUAGE_VOICE_MAP[language] || "onyx",
    supported: true, // OpenAI TTS supports many languages automatically
    provider: "OpenAI TTS",
    voices: VOICE_OPTIONS,
  });
}
