import { NextRequest, NextResponse } from "next/server";

/**
 * Murf.ai TTS - Primary provider (very natural, studio-quality voices)
 * Using verified voice IDs with Calm/Conversational styles for Bible reading
 */
const MURF_VOICES: Record<string, { voiceId: string; style: string; locale: string }> = {
  en: { voiceId: "en-US-wayne", style: "Calm", locale: "en-US" },           // Middle-aged, warm calm voice
  es: { voiceId: "es-MX-alejandro", style: "Calm", locale: "es-MX" },       // Spanish calm voice
  fr: { voiceId: "fr-FR-maxime", style: "Conversational", locale: "fr-FR" }, // French male
  de: { voiceId: "de-DE-josephine", style: "Calm", locale: "de-DE" },       // German calm (female available)
  it: { voiceId: "it-IT-giorgio", style: "Conversational", locale: "it-IT" }, // Italian male
  pt: { voiceId: "pt-BR-yago", style: "Conversational", locale: "pt-BR" }, // Portuguese male
  zh: { voiceId: "zh-CN-wei", style: "Calm", locale: "zh-CN" },             // Chinese calm voice
};

const MURF_VOICES_FEMALE: Record<string, { voiceId: string; style: string; locale: string }> = {
  en: { voiceId: "en-AU-joyce", style: "Narration", locale: "en-AU" },      // Warm female narration
  es: { voiceId: "es-ES-carla", style: "Conversational", locale: "es-ES" }, // Spanish female
  fr: { voiceId: "fr-FR-justine", style: "Calm", locale: "fr-FR" },         // French female calm
  de: { voiceId: "de-DE-josephine", style: "Calm", locale: "de-DE" },       // German female calm
  it: { voiceId: "it-IT-greta", style: "Conversational", locale: "it-IT" }, // Italian female
  pt: { voiceId: "pt-BR-isadora", style: "Conversational", locale: "pt-BR" }, // Portuguese female
  zh: { voiceId: "zh-CN-wei", style: "Calm", locale: "zh-CN" },             // Chinese female calm
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
 * Generate speech using Murf.ai (studio-quality natural voices)
 * Returns the audio as a Buffer
 */
async function synthesizeWithMurf(
  text: string,
  language: string,
  voiceGender: string = "male"
): Promise<{ buffer: Buffer; format: string }> {
  const apiKey = process.env.MURF_API_KEY;
  
  if (!apiKey) {
    throw new Error("Murf API key not configured");
  }

  // Select voice based on language and gender
  const voiceMap = voiceGender === "female" ? MURF_VOICES_FEMALE : MURF_VOICES;
  const voiceConfig = voiceMap[language] || voiceMap["en"];

  // Murf.ai request
  const response = await fetch("https://api.murf.ai/v1/speech/generate", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      voiceId: voiceConfig.voiceId,
      style: voiceConfig.style,
      format: "MP3",
      sampleRate: 24000,
      channelType: "MONO",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Murf.ai error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.audioFile) {
    throw new Error("No audio URL in Murf.ai response");
  }

  // Download the audio file
  const audioResponse = await fetch(data.audioFile);
  if (!audioResponse.ok) {
    throw new Error("Failed to download Murf.ai audio");
  }

  const arrayBuffer = await audioResponse.arrayBuffer();
  return { buffer: Buffer.from(arrayBuffer), format: "audio/mpeg" };
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

    // Limit text length (Murf.ai has generous limits)
    const maxLength = 5000;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    let audioBuffer: Buffer;

    // Try Murf.ai first (studio-quality natural voices)
    if (process.env.MURF_API_KEY) {
      try {
        const voiceConfig = voiceGender === "female" 
          ? MURF_VOICES_FEMALE[language] || MURF_VOICES_FEMALE["en"]
          : MURF_VOICES[language] || MURF_VOICES["en"];
        
        console.log(`TTS: Using Murf.ai (${voiceConfig.voiceId}, ${voiceConfig.style}), text length: ${truncatedText.length}`);
        
        const result = await synthesizeWithMurf(truncatedText, language, voiceGender);
        
        console.log(`TTS: Murf.ai generated ${result.buffer.length} bytes`);
        
        return NextResponse.json({
          audioContent: result.buffer.toString("base64"),
          contentType: result.format,
          provider: "murf",
        });
      } catch (murfError) {
        console.error("Murf.ai TTS failed, trying Azure:", murfError);
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

  const hasMurf = !!process.env.MURF_API_KEY;
  const hasAzure = !!process.env.AZURE_SPEECH_KEY;

  const murfVoice = MURF_VOICES[language] || MURF_VOICES["en"];
  const azureVoice = AZURE_VOICES[language] || AZURE_VOICES["en"];

  return NextResponse.json({
    language,
    primaryProvider: hasMurf ? "Murf.ai (studio-quality)" : hasAzure ? "Azure Speech" : "Browser",
    fallbackProvider: hasAzure ? "Azure Speech" : "Browser",
    voices: {
      murf: murfVoice ? `${murfVoice.voiceId} (${murfVoice.style})` : "Not configured",
      azure: azureVoice?.voice || "en-US-GuyNeural",
    },
    supported: true,
  });
}
