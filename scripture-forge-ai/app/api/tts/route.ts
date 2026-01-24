import { NextRequest, NextResponse } from "next/server";

// Azure Speech Neural Voice mapping - high quality, natural sounding
// Full list: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support
const AZURE_VOICES: Record<string, { voice: string; locale: string }> = {
  en: { voice: "en-US-GuyNeural", locale: "en-US" },           // Warm, natural male
  es: { voice: "es-ES-AlvaroNeural", locale: "es-ES" },        // Spanish (Spain)
  fr: { voice: "fr-FR-HenriNeural", locale: "fr-FR" },         // French
  de: { voice: "de-DE-ConradNeural", locale: "de-DE" },        // German
  it: { voice: "it-IT-DiegoNeural", locale: "it-IT" },         // Italian
  pt: { voice: "pt-BR-AntonioNeural", locale: "pt-BR" },       // Portuguese (Brazil)
  zh: { voice: "zh-CN-YunxiNeural", locale: "zh-CN" },         // Chinese (Mandarin)
  ja: { voice: "ja-JP-KeitaNeural", locale: "ja-JP" },         // Japanese
  ko: { voice: "ko-KR-InJoonNeural", locale: "ko-KR" },        // Korean
  nl: { voice: "nl-NL-MaartenNeural", locale: "nl-NL" },       // Dutch
  pl: { voice: "pl-PL-MarekNeural", locale: "pl-PL" },         // Polish
  ru: { voice: "ru-RU-DmitryNeural", locale: "ru-RU" },        // Russian
  ar: { voice: "ar-SA-HamedNeural", locale: "ar-SA" },         // Arabic (Saudi)
  hi: { voice: "hi-IN-MadhurNeural", locale: "hi-IN" },        // Hindi
  tr: { voice: "tr-TR-AhmetNeural", locale: "tr-TR" },         // Turkish
  vi: { voice: "vi-VN-NamMinhNeural", locale: "vi-VN" },       // Vietnamese
  th: { voice: "th-TH-NiwatNeural", locale: "th-TH" },         // Thai
  id: { voice: "id-ID-ArdiNeural", locale: "id-ID" },          // Indonesian
  sw: { voice: "sw-KE-RafikiNeural", locale: "sw-KE" },        // Swahili
};

// Alternative female voices
const AZURE_VOICES_FEMALE: Record<string, { voice: string; locale: string }> = {
  en: { voice: "en-US-JennyNeural", locale: "en-US" },
  es: { voice: "es-ES-ElviraNeural", locale: "es-ES" },
  fr: { voice: "fr-FR-DeniseNeural", locale: "fr-FR" },
  de: { voice: "de-DE-KatjaNeural", locale: "de-DE" },
  it: { voice: "it-IT-ElsaNeural", locale: "it-IT" },
  pt: { voice: "pt-BR-FranciscaNeural", locale: "pt-BR" },
  zh: { voice: "zh-CN-XiaoxiaoNeural", locale: "zh-CN" },
  ja: { voice: "ja-JP-NanamiNeural", locale: "ja-JP" },
  ko: { voice: "ko-KR-SunHiNeural", locale: "ko-KR" },
};

// Use Azure REST API instead of SDK for serverless compatibility
async function synthesizeSpeechAzure(text: string, voiceName: string, locale: string, subscriptionKey: string, region: string): Promise<Buffer> {
  // Create SSML
  const ssml = `<speak version='1.0' xml:lang='${locale}'>
    <voice xml:lang='${locale}' name='${voiceName}'>
      <prosody rate='-5%'>
        ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </prosody>
    </voice>
  </speak>`;

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      'User-Agent': 'ScriptureForgeAI',
    },
    body: ssml,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure TTS error ${response.status}: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const { text, language = "en", voiceGender = "male" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Check for Azure Speech credentials
    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || "eastus";

    if (!subscriptionKey) {
      console.error("AZURE_SPEECH_KEY not configured - returning fallback flag");
      return NextResponse.json(
        { error: "TTS not configured", useFallback: true },
        { status: 503 }
      );
    }

    // Limit text length (Azure has ~10 min limit, but we'll cap at ~5000 chars for performance)
    const maxLength = 5000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    // Get voice for language
    const voiceMap = voiceGender === "female" ? AZURE_VOICES_FEMALE : AZURE_VOICES;
    const voiceConfig = voiceMap[language] || AZURE_VOICES[language] || AZURE_VOICES["en"];

    console.log(`TTS: Generating audio with Azure, voice: ${voiceConfig.voice}, text length: ${truncatedText.length}`);

    // Generate speech using Azure Speech REST API
    const audioBuffer = await synthesizeSpeechAzure(truncatedText, voiceConfig.voice, voiceConfig.locale, subscriptionKey, region);
    const base64Audio = audioBuffer.toString("base64");

    console.log(`TTS: Generated audio, size: ${audioBuffer.length} bytes`);

    return NextResponse.json({
      audioContent: base64Audio,
      contentType: "audio/mpeg",
    });
  } catch (error) {
    console.error("TTS error:", error);

    // Provide specific error messages
    if (error instanceof Error) {
      // Quota/billing issues
      if (error.message.includes("quota") || error.message.includes("402") || error.message.includes("billing")) {
        return NextResponse.json(
          { error: "TTS quota exceeded", useFallback: true },
          { status: 503 }
        );
      }
      // Authentication issues
      if (error.message.includes("401") || error.message.includes("authentication") || error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: "TTS authentication failed", useFallback: true },
          { status: 503 }
        );
      }
      // Rate limit
      if (error.message.includes("429") || error.message.includes("rate")) {
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

  const voiceConfig = AZURE_VOICES[language] || AZURE_VOICES["en"];

  return NextResponse.json({
    language,
    voice: voiceConfig.voice,
    locale: voiceConfig.locale,
    supported: !!AZURE_VOICES[language],
    provider: "Azure Speech (Free: 500K chars/month)",
  });
}
