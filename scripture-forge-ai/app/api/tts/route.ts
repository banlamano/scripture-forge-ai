import { NextRequest, NextResponse } from "next/server";

// Azure Speech Neural Voice mapping - optimized for natural Bible narration
// Using voices confirmed to support speaking styles
// Docs: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-voice-support
const AZURE_VOICES: Record<string, { voice: string; locale: string; style?: string; styleDegree?: number }> = {
  // English - Guy is warm and natural for reading
  en: { voice: "en-US-GuyNeural", locale: "en-US" },
  // Spanish - Alvaro supports styles
  es: { voice: "es-ES-AlvaroNeural", locale: "es-ES" },
  // French - Henri is warm and clear
  fr: { voice: "fr-FR-HenriNeural", locale: "fr-FR" },
  // German - Conrad supports calm style
  de: { voice: "de-DE-ConradNeural", locale: "de-DE", style: "calm", styleDegree: 1.0 },
  // Italian - Diego is warm
  it: { voice: "it-IT-DiegoNeural", locale: "it-IT" },
  // Portuguese - Antonio is clear and warm
  pt: { voice: "pt-BR-AntonioNeural", locale: "pt-BR" },
  // Chinese - Yunxi supports many styles including narration
  zh: { voice: "zh-CN-YunxiNeural", locale: "zh-CN", style: "calm", styleDegree: 1.0 },
  // Japanese
  ja: { voice: "ja-JP-KeitaNeural", locale: "ja-JP" },
  // Korean
  ko: { voice: "ko-KR-InJoonNeural", locale: "ko-KR" },
  // Dutch
  nl: { voice: "nl-NL-MaartenNeural", locale: "nl-NL" },
  // Polish
  pl: { voice: "pl-PL-MarekNeural", locale: "pl-PL" },
  // Russian
  ru: { voice: "ru-RU-DmitryNeural", locale: "ru-RU" },
  // Arabic
  ar: { voice: "ar-SA-HamedNeural", locale: "ar-SA" },
  // Hindi
  hi: { voice: "hi-IN-MadhurNeural", locale: "hi-IN" },
  // Turkish
  tr: { voice: "tr-TR-AhmetNeural", locale: "tr-TR" },
  // Vietnamese
  vi: { voice: "vi-VN-NamMinhNeural", locale: "vi-VN" },
  // Thai
  th: { voice: "th-TH-NiwatNeural", locale: "th-TH" },
  // Indonesian
  id: { voice: "id-ID-ArdiNeural", locale: "id-ID" },
  // Swahili
  sw: { voice: "sw-KE-RafikiNeural", locale: "sw-KE" },
};

// Alternative female voices
const AZURE_VOICES_FEMALE: Record<string, { voice: string; locale: string; style?: string; styleDegree?: number }> = {
  en: { voice: "en-US-JennyNeural", locale: "en-US" },
  es: { voice: "es-ES-ElviraNeural", locale: "es-ES" },
  fr: { voice: "fr-FR-DeniseNeural", locale: "fr-FR" },
  de: { voice: "de-DE-KatjaNeural", locale: "de-DE" },
  it: { voice: "it-IT-ElsaNeural", locale: "it-IT" },
  pt: { voice: "pt-BR-FranciscaNeural", locale: "pt-BR" },
  zh: { voice: "zh-CN-XiaoxiaoNeural", locale: "zh-CN", style: "calm", styleDegree: 1.0 },
  ja: { voice: "ja-JP-NanamiNeural", locale: "ja-JP" },
  ko: { voice: "ko-KR-SunHiNeural", locale: "ko-KR" },
};

/**
 * Process text to add natural pauses for Bible reading
 * Uses simple SSML break tags for more human-like speech patterns
 */
function processTextForNaturalSpeech(text: string): string {
  // First, escape XML special characters
  let processed = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  
  // Add natural pauses after punctuation
  // Period - longer pause at end of sentences
  processed = processed.replace(/\.\s+/g, '. <break time="500ms"/> ');
  
  // Colon - pause before quoted speech or lists
  processed = processed.replace(/:\s+/g, ': <break time="400ms"/> ');
  
  // Semicolon - medium pause
  processed = processed.replace(/;\s+/g, '; <break time="300ms"/> ');
  
  // Comma - short natural pause
  processed = processed.replace(/,\s+/g, ', <break time="180ms"/> ');
  
  // Question mark
  processed = processed.replace(/\?\s+/g, '? <break time="500ms"/> ');
  
  // Exclamation
  processed = processed.replace(/!\s+/g, '! <break time="500ms"/> ');
  
  return processed;
}

// Use Azure REST API instead of SDK for serverless compatibility
async function synthesizeSpeechAzure(
  text: string, 
  voiceName: string, 
  locale: string, 
  subscriptionKey: string, 
  region: string,
  style?: string,
  styleDegree?: number
): Promise<Buffer> {
  // Process text for natural speech patterns
  const processedText = processTextForNaturalSpeech(text);
  
  // Build SSML - keep it simple for reliability
  // Using slower rate for natural Bible reading
  let ssml: string;
  
  if (style) {
    // With style support (mstts namespace required)
    const degree = styleDegree || 1.0;
    ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${locale}">
      <voice name="${voiceName}">
        <mstts:express-as style="${style}" styledegree="${degree}">
          <prosody rate="-10%" pitch="-2%">
            ${processedText}
          </prosody>
        </mstts:express-as>
      </voice>
    </speak>`;
  } else {
    // Without style - simpler SSML
    ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${locale}">
      <voice name="${voiceName}">
        <prosody rate="-10%" pitch="-2%">
          ${processedText}
        </prosody>
      </voice>
    </speak>`;
  }

  const endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/ssml+xml',
      // Use higher quality audio format (24kHz for richer sound)
      'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
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

    console.log(`TTS: Generating audio with Azure, voice: ${voiceConfig.voice}, style: ${voiceConfig.style || 'default'}, styleDegree: ${voiceConfig.styleDegree || 1.0}, text length: ${truncatedText.length}`);

    // Generate speech using Azure Speech REST API
    const audioBuffer = await synthesizeSpeechAzure(
      truncatedText, 
      voiceConfig.voice, 
      voiceConfig.locale, 
      subscriptionKey, 
      region, 
      voiceConfig.style,
      voiceConfig.styleDegree
    );
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
