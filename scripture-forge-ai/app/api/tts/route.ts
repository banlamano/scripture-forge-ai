import { NextRequest, NextResponse } from "next/server";

// Microsoft Edge TTS Voice mapping
// Using Neural voices - completely FREE, high quality
// Voice list: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support
const EDGE_VOICES: Record<string, { voice: string; lang: string }> = {
  // Male voices (default)
  en: { voice: "en-US-GuyNeural", lang: "en-US" },
  es: { voice: "es-ES-AlvaroNeural", lang: "es-ES" },
  fr: { voice: "fr-FR-HenriNeural", lang: "fr-FR" },
  de: { voice: "de-DE-ConradNeural", lang: "de-DE" },
  it: { voice: "it-IT-DiegoNeural", lang: "it-IT" },
  pt: { voice: "pt-BR-AntonioNeural", lang: "pt-BR" },
  zh: { voice: "zh-CN-YunxiNeural", lang: "zh-CN" },
  ja: { voice: "ja-JP-KeitaNeural", lang: "ja-JP" },
  ko: { voice: "ko-KR-InJoonNeural", lang: "ko-KR" },
  nl: { voice: "nl-NL-MaartenNeural", lang: "nl-NL" },
  pl: { voice: "pl-PL-MarekNeural", lang: "pl-PL" },
  ru: { voice: "ru-RU-DmitryNeural", lang: "ru-RU" },
  ar: { voice: "ar-SA-HamedNeural", lang: "ar-SA" },
  hi: { voice: "hi-IN-MadhurNeural", lang: "hi-IN" },
  tr: { voice: "tr-TR-AhmetNeural", lang: "tr-TR" },
  vi: { voice: "vi-VN-NamMinhNeural", lang: "vi-VN" },
  th: { voice: "th-TH-NiwatNeural", lang: "th-TH" },
  id: { voice: "id-ID-ArdiNeural", lang: "id-ID" },
  sw: { voice: "sw-KE-RafikiNeural", lang: "sw-KE" },
};

// Female voice alternatives
const EDGE_VOICES_FEMALE: Record<string, { voice: string; lang: string }> = {
  en: { voice: "en-US-JennyNeural", lang: "en-US" },
  es: { voice: "es-ES-ElviraNeural", lang: "es-ES" },
  fr: { voice: "fr-FR-DeniseNeural", lang: "fr-FR" },
  de: { voice: "de-DE-KatjaNeural", lang: "de-DE" },
  it: { voice: "it-IT-ElsaNeural", lang: "it-IT" },
  pt: { voice: "pt-BR-FranciscaNeural", lang: "pt-BR" },
  zh: { voice: "zh-CN-XiaoxiaoNeural", lang: "zh-CN" },
  ja: { voice: "ja-JP-NanamiNeural", lang: "ja-JP" },
  ko: { voice: "ko-KR-SunHiNeural", lang: "ko-KR" },
  nl: { voice: "nl-NL-ColetteNeural", lang: "nl-NL" },
  pl: { voice: "pl-PL-ZofiaNeural", lang: "pl-PL" },
  ru: { voice: "ru-RU-SvetlanaNeural", lang: "ru-RU" },
  ar: { voice: "ar-SA-ZariyahNeural", lang: "ar-SA" },
  hi: { voice: "hi-IN-SwaraNeural", lang: "hi-IN" },
  tr: { voice: "tr-TR-EmelNeural", lang: "tr-TR" },
  vi: { voice: "vi-VN-HoaiMyNeural", lang: "vi-VN" },
  th: { voice: "th-TH-PremwadeeNeural", lang: "th-TH" },
  id: { voice: "id-ID-GadisNeural", lang: "id-ID" },
  sw: { voice: "sw-KE-ZuriNeural", lang: "sw-KE" },
};

// Edge TTS WebSocket endpoint
const EDGE_TTS_ENDPOINT = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";

// Generate unique request ID
function generateRequestId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create SSML for Edge TTS
function createSSML(text: string, voice: string, rate: string = "-5%", pitch: string = "+0Hz"): string {
  // Escape XML special characters
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
    <voice name="${voice}">
      <prosody rate="${rate}" pitch="${pitch}">
        ${escapedText}
      </prosody>
    </voice>
  </speak>`;
}

export async function POST(request: NextRequest) {
  try {
    const { text, language = "en", voiceGender = "male" } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Get voice configuration for the language
    const voiceMap = voiceGender === "female" ? EDGE_VOICES_FEMALE : EDGE_VOICES;
    const voiceConfig = voiceMap[language] || voiceMap["en"];

    // Use edge-tts npm package approach via HTTP
    // We'll use a simpler REST-like approach with the Edge TTS service
    const requestId = generateRequestId();
    const ssml = createSSML(text, voiceConfig.voice, "-5%", "+0Hz");

    // Edge TTS synthesis via HTTP endpoint
    const synthesizeUrl = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${requestId}`;

    const response = await fetch(synthesizeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
      },
      body: ssml,
    });

    if (!response.ok) {
      console.error("Edge TTS error:", response.status, response.statusText);
      
      // If Edge TTS fails, return error (frontend will use browser fallback)
      return NextResponse.json(
        { error: "TTS service temporarily unavailable", fallback: true },
        { status: 503 }
      );
    }

    // Get audio as ArrayBuffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return NextResponse.json({
      audioContent: base64Audio,
      contentType: "audio/mpeg",
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Internal server error", fallback: true },
      { status: 500 }
    );
  }
}

// GET endpoint to check available voices for a language
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "en";

  const maleVoice = EDGE_VOICES[language] || EDGE_VOICES["en"];
  const femaleVoice = EDGE_VOICES_FEMALE[language] || EDGE_VOICES_FEMALE["en"];

  return NextResponse.json({
    language,
    voices: {
      male: maleVoice,
      female: femaleVoice,
    },
    supported: !!EDGE_VOICES[language],
    provider: "Microsoft Edge TTS (Free)",
  });
}
