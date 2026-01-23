import { NextRequest, NextResponse } from "next/server";

// This endpoint returns voice configuration for client-side TTS
// The actual TTS is done in the browser using Web Speech API
// This is 100% FREE and works on all modern browsers

// Language to voice locale mapping
const LANGUAGE_LOCALES: Record<string, string[]> = {
  en: ["en-US", "en-GB", "en-AU", "en"],
  es: ["es-ES", "es-MX", "es-US", "es"],
  fr: ["fr-FR", "fr-CA", "fr"],
  de: ["de-DE", "de-AT", "de"],
  it: ["it-IT", "it"],
  pt: ["pt-BR", "pt-PT", "pt"],
  zh: ["zh-CN", "zh-TW", "zh-HK", "zh"],
  ja: ["ja-JP", "ja"],
  ko: ["ko-KR", "ko"],
  nl: ["nl-NL", "nl-BE", "nl"],
  pl: ["pl-PL", "pl"],
  ru: ["ru-RU", "ru"],
  ar: ["ar-SA", "ar-EG", "ar"],
  hi: ["hi-IN", "hi"],
  tr: ["tr-TR", "tr"],
  vi: ["vi-VN", "vi"],
  th: ["th-TH", "th"],
  id: ["id-ID", "id"],
  sw: ["sw-KE", "sw-TZ", "sw"],
};

export async function POST(request: NextRequest) {
  try {
    const { language = "en" } = await request.json();

    // Return voice configuration for client-side TTS
    const locales = LANGUAGE_LOCALES[language] || LANGUAGE_LOCALES["en"];

    return NextResponse.json({
      useBrowserTTS: true,
      language,
      locales,
      settings: {
        rate: 0.9,
        pitch: 1,
        volume: 1,
      },
    });
  } catch (error) {
    console.error("TTS config error:", error);
    return NextResponse.json(
      { error: "Failed to get TTS config", useBrowserTTS: true },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "en";

  const locales = LANGUAGE_LOCALES[language] || LANGUAGE_LOCALES["en"];

  return NextResponse.json({
    language,
    locales,
    supported: !!LANGUAGE_LOCALES[language],
    provider: "Browser Web Speech API (Free)",
  });
}
