import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * OpenAI TTS - Primary provider (most natural sounding)
 * Voices: alloy, echo, fable, onyx, nova, shimmer
 * - onyx: deep, warm male voice - great for Bible reading
 * - nova: warm female voice
 * - alloy: neutral, clear
 */
const OPENAI_VOICES = {
  male: "onyx",      // Deep, warm - perfect for scripture
  female: "nova",    // Warm, clear female voice
  neutral: "alloy",  // Neutral, versatile
};

/**
 * Azure Speech voices - using the most natural sounding neural voices
 * DragonHD voices are the most natural when available
 */
const AZURE_VOICES: Record<string, { voice: string; locale: string; style?: string }> = {
  // English - Andrew is one of the most natural Azure voices
  en: { voice: "en-US-AndrewMultilingualNeural", locale: "en-US" },
  // Spanish - Alvaro has good expression
  es: { voice: "es-ES-AlvaroNeural", locale: "es-ES" },
  // French - Vivienne is very natural
  fr: { voice: "fr-FR-VivienneMultilingualNeural", locale: "fr-FR" },
  // German - Florian is clear and natural
  de: { voice: "de-DE-FlorianMultilingualNeural", locale: "de-DE" },
  // Italian - Diego is warm
  it: { voice: "it-IT-DiegoNeural", locale: "it-IT" },
  // Portuguese - Antonio is clear
  pt: { voice: "pt-BR-AntonioNeural", locale: "pt-BR" },
  // Chinese - Yunxi with calm style
  zh: { voice: "zh-CN-YunxiNeural", locale: "zh-CN", style: "calm" },
  // Japanese
  ja: { voice: "ja-JP-KeitaNeural", locale: "ja-JP" },
  // Korean
  ko: { voice: "ko-KR-InJoonNeural", locale: "ko-KR" },
};

/**
 * Generate speech using OpenAI TTS (most natural)
 * OpenAI TTS produces incredibly human-like speech
 */
async function synthesizeWithOpenAI(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "onyx"
): Promise<Buffer> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // OpenAI TTS has a 4096 character limit
  const truncatedText = text.length > 4096 ? text.substring(0, 4096) : text;

  const response = await openai.audio.speech.create({
    model: "tts-1-hd",  // High-definition model for best quality
    voice: voice,
    input: truncatedText,
    speed: 0.95,  // Slightly slower for Bible reading
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Azure TTS - optimized for natural Bible reading
 */
async function synthesizeWithAzure(
  text: string,
  language: string
): Promise<Buffer> {
  const subscriptionKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || "eastus";

  if (!subscriptionKey) {
    throw new Error("Azure Speech not configured");
  }

  const voiceConfig = AZURE_VOICES[language] || AZURE_VOICES["en"];
  
  // Escape XML characters
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  // Build SSML with natural reading prosody
  let ssml: string;
  
  if (voiceConfig.style) {
    // Use style when available (requires mstts namespace)
    ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${voiceConfig.locale}">
      <voice name="${voiceConfig.voice}">
        <mstts:express-as style="${voiceConfig.style}">
          <prosody rate="0.92" pitch="-2%">
            ${escapedText}
          </prosody>
        </mstts:express-as>
      </voice>
    </speak>`;
  } else {
    // Standard SSML with natural prosody for reading
    ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${voiceConfig.locale}">
      <voice name="${voiceConfig.voice}">
        <prosody rate="0.92" pitch="-2%">
          ${escapedText}
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
      // Use high quality audio format
      'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
      'User-Agent': 'ScriptureForgeAI',
    },
    body: ssml,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Azure TTS error: ${response.status} - ${errorText}`);
    throw new Error(`Azure TTS error ${response.status}`);
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

    // Limit text length
    const maxLength = 4000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    let audioBuffer: Buffer;

    // Try OpenAI TTS first (most natural sounding)
    if (process.env.OPENAI_API_KEY) {
      try {
        // Select voice based on gender preference
        const voice = voiceGender === "female" ? "nova" : "onyx";
        
        console.log(`TTS: Using OpenAI (${voice}), text length: ${truncatedText.length}`);
        
        audioBuffer = await synthesizeWithOpenAI(truncatedText, voice);
        
        console.log(`TTS: OpenAI generated ${audioBuffer.length} bytes`);
        
        return NextResponse.json({
          audioContent: audioBuffer.toString("base64"),
          contentType: "audio/mpeg",
          provider: "openai",
        });
      } catch (openaiError) {
        console.error("OpenAI TTS failed, trying Azure:", openaiError);
        // Fall through to Azure
      }
    }

    // Fallback to Azure TTS
    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    if (!subscriptionKey) {
      console.error("No TTS provider configured");
      return NextResponse.json(
        { error: "TTS not configured", useFallback: true },
        { status: 503 }
      );
    }

    console.log(`TTS: Using Azure fallback for ${language}`);
    
    audioBuffer = await synthesizeWithAzure(truncatedText, language);
    
    console.log(`TTS: Azure generated ${audioBuffer.length} bytes`);

    return NextResponse.json({
      audioContent: audioBuffer.toString("base64"),
      contentType: "audio/mpeg",
      provider: "azure",
    });

  } catch (error) {
    console.error("TTS error:", error);
    
    return NextResponse.json(
      { error: "TTS service unavailable", useFallback: true },
      { status: 503 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language") || "en";

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAzure = !!process.env.AZURE_SPEECH_KEY;

  return NextResponse.json({
    language,
    primaryProvider: hasOpenAI ? "OpenAI TTS (natural voices)" : "Azure Speech",
    fallbackProvider: hasAzure ? "Azure Speech" : "Browser",
    voices: {
      openai: ["onyx (male)", "nova (female)", "alloy (neutral)"],
      azure: AZURE_VOICES[language]?.voice || "en-US-GuyNeural",
    },
    supported: true,
  });
}
