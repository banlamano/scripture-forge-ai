import { NextRequest, NextResponse } from "next/server";

// Language to Google Cloud TTS voice mapping
// Using Neural2 voices - Google's most natural and latest AI voices
const LANGUAGE_VOICE_MAP: Record<string, { languageCode: string; name: string; ssmlGender: string }> = {
  en: { languageCode: "en-US", name: "en-US-Neural2-D", ssmlGender: "MALE" },
  es: { languageCode: "es-ES", name: "es-ES-Neural2-B", ssmlGender: "MALE" },
  fr: { languageCode: "fr-FR", name: "fr-FR-Neural2-B", ssmlGender: "MALE" },
  de: { languageCode: "de-DE", name: "de-DE-Neural2-B", ssmlGender: "MALE" },
  it: { languageCode: "it-IT", name: "it-IT-Neural2-C", ssmlGender: "MALE" },
  pt: { languageCode: "pt-BR", name: "pt-BR-Neural2-B", ssmlGender: "MALE" },
  zh: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-B", ssmlGender: "MALE" }, // Neural2 not available for Chinese, using Wavenet
  // Additional languages with Neural2 support
  ja: { languageCode: "ja-JP", name: "ja-JP-Neural2-B", ssmlGender: "MALE" },
  ko: { languageCode: "ko-KR", name: "ko-KR-Neural2-B", ssmlGender: "MALE" },
  nl: { languageCode: "nl-NL", name: "nl-NL-Neural2-B", ssmlGender: "MALE" },
  pl: { languageCode: "pl-PL", name: "pl-PL-Neural2-B", ssmlGender: "MALE" },
  ru: { languageCode: "ru-RU", name: "ru-RU-Neural2-B", ssmlGender: "MALE" },
  ar: { languageCode: "ar-XA", name: "ar-XA-Wavenet-B", ssmlGender: "MALE" }, // Neural2 not available, using Wavenet
  hi: { languageCode: "hi-IN", name: "hi-IN-Neural2-B", ssmlGender: "MALE" },
  // Add more languages as needed
};

// Female voice alternatives - Neural2 where available
const FEMALE_VOICES: Record<string, { languageCode: string; name: string; ssmlGender: string }> = {
  en: { languageCode: "en-US", name: "en-US-Neural2-F", ssmlGender: "FEMALE" },
  es: { languageCode: "es-ES", name: "es-ES-Neural2-A", ssmlGender: "FEMALE" },
  fr: { languageCode: "fr-FR", name: "fr-FR-Neural2-A", ssmlGender: "FEMALE" },
  de: { languageCode: "de-DE", name: "de-DE-Neural2-A", ssmlGender: "FEMALE" },
  it: { languageCode: "it-IT", name: "it-IT-Neural2-A", ssmlGender: "FEMALE" },
  pt: { languageCode: "pt-BR", name: "pt-BR-Neural2-A", ssmlGender: "FEMALE" },
  zh: { languageCode: "cmn-CN", name: "cmn-CN-Wavenet-A", ssmlGender: "FEMALE" },
  ja: { languageCode: "ja-JP", name: "ja-JP-Neural2-B", ssmlGender: "FEMALE" },
  ko: { languageCode: "ko-KR", name: "ko-KR-Neural2-A", ssmlGender: "FEMALE" },
  nl: { languageCode: "nl-NL", name: "nl-NL-Neural2-A", ssmlGender: "FEMALE" },
  pl: { languageCode: "pl-PL", name: "pl-PL-Neural2-A", ssmlGender: "FEMALE" },
  ru: { languageCode: "ru-RU", name: "ru-RU-Neural2-A", ssmlGender: "FEMALE" },
  ar: { languageCode: "ar-XA", name: "ar-XA-Wavenet-A", ssmlGender: "FEMALE" },
  hi: { languageCode: "hi-IN", name: "hi-IN-Neural2-A", ssmlGender: "FEMALE" },
};

export async function POST(request: NextRequest) {
  try {
    const { text, language = "en", voiceGender = "male" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_CLOUD_TTS_API_KEY not configured");
      return NextResponse.json(
        { error: "TTS service not configured" },
        { status: 500 }
      );
    }

    // Get voice configuration for the language
    const voiceMap = voiceGender === "female" ? FEMALE_VOICES : LANGUAGE_VOICE_MAP;
    const voiceConfig = voiceMap[language] || voiceMap["en"];

    // Prepare the request to Google Cloud TTS API
    const ttsRequest = {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
        ssmlGender: voiceConfig.ssmlGender,
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.95, // Slightly slower for scripture reading
        pitch: 0,
        volumeGainDb: 0,
        effectsProfileId: ["large-home-entertainment-class-device"], // Optimized for speakers
      },
    };

    // Call Google Cloud TTS API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ttsRequest),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google TTS API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate audio" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return the base64-encoded audio content
    return NextResponse.json({
      audioContent: data.audioContent,
      contentType: "audio/mpeg",
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check available voices for a language
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "en";

  const maleVoice = LANGUAGE_VOICE_MAP[language] || LANGUAGE_VOICE_MAP["en"];
  const femaleVoice = FEMALE_VOICES[language] || FEMALE_VOICES["en"];

  return NextResponse.json({
    language,
    voices: {
      male: maleVoice,
      female: femaleVoice,
    },
    supported: !!LANGUAGE_VOICE_MAP[language],
  });
}
