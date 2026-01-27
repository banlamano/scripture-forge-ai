import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// Create Groq client lazily to ensure env var is available at runtime
function getGroqClient() {
  return createOpenAI({
    apiKey: process.env.GROQ_API_KEY ?? "",
    baseURL: "https://api.groq.com/openai/v1",
  });
}

// Language configurations for professional multi-language support
const LANGUAGE_CONFIG: Record<string, { 
  name: string; 
  nativeName: string;
  bibleTranslation: string;
  greeting: string;
}> = {
  en: { 
    name: "English", 
    nativeName: "English",
    bibleTranslation: "ESV, NIV, or KJV",
    greeting: "Hello! I'm here to help you explore God's Word."
  },
  es: { 
    name: "Spanish", 
    nativeName: "Español",
    bibleTranslation: "Reina Valera 1960 or NVI",
    greeting: "¡Hola! Estoy aquí para ayudarte a explorar la Palabra de Dios."
  },
  de: { 
    name: "German", 
    nativeName: "Deutsch",
    bibleTranslation: "Luther Bibel or Schlachter",
    greeting: "Hallo! Ich bin hier, um dir zu helfen, Gottes Wort zu erforschen."
  },
  fr: { 
    name: "French", 
    nativeName: "Français",
    bibleTranslation: "Louis Segond or NBS",
    greeting: "Bonjour! Je suis là pour vous aider à explorer la Parole de Dieu."
  },
  pt: { 
    name: "Portuguese", 
    nativeName: "Português",
    bibleTranslation: "Almeida Revista e Atualizada or NVI",
    greeting: "Olá! Estou aqui para ajudá-lo a explorar a Palavra de Deus."
  },
  zh: { 
    name: "Chinese (Simplified)", 
    nativeName: "中文",
    bibleTranslation: "和合本 (Chinese Union Version)",
    greeting: "你好！我在这里帮助你探索上帝的话语。"
  },
  it: { 
    name: "Italian", 
    nativeName: "Italiano",
    bibleTranslation: "Nuova Riveduta or CEI",
    greeting: "Ciao! Sono qui per aiutarti ad esplorare la Parola di Dio."
  },
};

// Get comprehensive system prompt for professional ChatGPT-like experience
function getSystemPrompt(lang: string = "en"): string {
  const config = LANGUAGE_CONFIG[lang] || LANGUAGE_CONFIG["en"];
  
  const languageInstruction = lang !== "en" 
    ? `

## CRITICAL LANGUAGE REQUIREMENT
You MUST respond ENTIRELY in ${config.nativeName} (${config.name}). This is non-negotiable.
- All explanations, insights, and applications must be in ${config.nativeName}
- When quoting Bible verses, use ${config.bibleTranslation} translation
- If you don't know the exact translation, provide your best ${config.nativeName} translation of the verse
- Never mix languages - respond 100% in ${config.nativeName}`
    : "";

  return `You are ScriptureForge AI — a warm, knowledgeable, and spiritually encouraging Bible study companion. You combine deep biblical scholarship with pastoral warmth to help users grow in their faith and understanding of Scripture.

## YOUR PERSONALITY
- **Warm & Welcoming**: Like a trusted pastor or mentor who genuinely cares
- **Knowledgeable**: Deep understanding of biblical text, history, theology, and original languages
- **Balanced**: Present mainstream Christian interpretations while acknowledging where traditions differ
- **Encouraging**: Always point users toward hope, growth, and deeper relationship with God
- **Humble**: Acknowledge limitations and recommend professional pastoral care when appropriate

## RESPONSE GUIDELINES

### For Bible Verse Questions:
1. **Quote the verse** accurately with the reference (Book Chapter:Verse)
2. **Context**: Explain what comes before and after this passage
3. **Historical Background**: Share relevant cultural, geographical, or historical insights
4. **Original Language**: When helpful, explain key Hebrew (OT) or Greek (NT) words
5. **Theological Significance**: What does this teach us about God, humanity, or salvation?
6. **Practical Application**: How can this truth transform our daily lives?
7. **Cross-References**: Suggest 2-3 related passages for deeper study

### For Topical Questions:
1. Provide a clear, direct answer grounded in Scripture
2. Support with multiple relevant Bible passages (3-5 verses)
3. Acknowledge different perspectives if the topic is debated among Christians
4. Offer practical wisdom for applying biblical principles

### For Devotional Requests:
1. Start with an engaging hook or reflection question
2. Present the Scripture passage with full text
3. Offer deep, meaningful meditation on the text
4. Include practical application points
5. Close with a prayer the user can pray
6. Suggest further reading

### For Prayer Guidance:
1. Acknowledge the user's situation with compassion
2. Share relevant Scripture promises
3. Offer a model prayer they can use or adapt
4. Encourage continued conversation with God

## FORMATTING
- Use **bold** for emphasis and key terms
- Use bullet points for lists and applications
- Use > blockquotes for Scripture quotations
- Structure longer responses with clear headings
- Keep paragraphs focused and readable

## IMPORTANT BOUNDARIES
- Never claim divine revelation or make personal prophecies
- Don't provide medical, legal, or financial advice
- Avoid taking sides on divisive political issues
- For serious struggles (mental health, abuse, etc.), always recommend professional help
- Be honest when a question goes beyond what Scripture directly addresses

## WHAT MAKES YOU SPECIAL
Unlike generic AI, you are specifically trained to:
- Always ground responses in biblical truth
- Maintain theological accuracy and reverence
- Provide spiritually nourishing conversations
- Help users encounter God through His Word${languageInstruction}`;
}

// Fetch verse from bible-api.com for accuracy
async function fetchVerseFromBibleAPI(reference: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    if (!response.ok) return null;
    const data = await response.json();
    return `${data.reference}: "${data.text.trim()}"`;
  } catch {
    return null;
  }
}

// Extract verse references from user query
function extractVerseReferences(query: string): string[] {
  const pattern = /(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?/g;
  const matches = query.match(pattern);
  return matches ? [...new Set(matches)] : [];
}

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a rate limit error
      const isRateLimit = error?.message?.includes("rate limit") || 
                          error?.message?.includes("Rate limit") ||
                          error?.status === 429;
      
      if (!isRateLimit || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export const maxDuration = 60;

// CORS headers for development
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS preflight request
export async function OPTIONS(req: Request) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const { messages, lang = "en" } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;
    
    // Get the system prompt with language instruction
    const systemPrompt = getSystemPrompt(lang);

    // Extract and fetch any Bible verses mentioned (with timeout)
    const references = extractVerseReferences(userQuery);
    let bibleContext = "";
    
    if (references.length > 0) {
      try {
        const verses = await Promise.race([
          Promise.all(references.slice(0, 3).map(ref => fetchVerseFromBibleAPI(ref))),
          new Promise<null[]>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
        ]) as (string | null)[];
        
        const validVerses = verses.filter(v => v !== null);
        if (validVerses.length > 0) {
          bibleContext = `\n\nACCURATE BIBLE TEXT (KJV from bible-api.com):\n${validVerses.join("\n")}\n\nUse this exact text when quoting.`;
        }
      } catch {
        // Continue without Bible context if fetch fails
        console.log("Bible verse fetch skipped due to timeout or error");
      }
    }

    // Determine which AI provider to use (priority: Groq > OpenAI > Anthropic)
    const hasGroq = !!process.env.GROQ_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    
    let result;
    let provider = "none";
    
    // Configuration for professional-quality responses
    const chatConfig = {
      temperature: 0.75, // Slightly higher for more natural, conversational responses
      maxTokens: 4000,   // Allow longer, more comprehensive responses
    };

    // Try Groq first (fastest), then OpenAI, then Anthropic
    if (hasGroq) {
      try {
        const groqClient = getGroqClient();
        result = await streamText({
          model: groqClient("llama-3.3-70b-versatile"),
          system: systemPrompt + bibleContext,
          messages: messages,
          temperature: chatConfig.temperature,
          maxTokens: chatConfig.maxTokens,
        });
        provider = "groq";
      } catch (groqError: any) {
        console.log("Groq failed:", groqError?.message);
        
        // Fallback to OpenAI
        if (hasOpenAI) {
          try {
            result = await retryWithBackoff(async () => {
              return await streamText({
                model: openai("gpt-4o-mini"),
                system: systemPrompt + bibleContext,
                messages: messages,
                temperature: chatConfig.temperature,
                maxTokens: chatConfig.maxTokens,
              });
            }, 2, 1000);
            provider = "openai";
          } catch (openaiError: any) {
            console.log("OpenAI also failed:", openaiError?.message);
            if (hasAnthropic) {
              result = await streamText({
                model: anthropic("claude-3-haiku-20240307"),
                system: systemPrompt + bibleContext,
                messages: messages,
                temperature: chatConfig.temperature,
                maxTokens: chatConfig.maxTokens,
              });
              provider = "anthropic";
            } else {
              throw openaiError;
            }
          }
        } else if (hasAnthropic) {
          result = await streamText({
            model: anthropic("claude-3-haiku-20240307"),
            system: systemPrompt + bibleContext,
            messages: messages,
            temperature: chatConfig.temperature,
            maxTokens: chatConfig.maxTokens,
          });
          provider = "anthropic";
        } else {
          throw groqError;
        }
      }
    } else if (hasOpenAI) {
      result = await retryWithBackoff(async () => {
        return await streamText({
          model: openai("gpt-4o-mini"),
          system: systemPrompt + bibleContext,
          messages: messages,
          temperature: chatConfig.temperature,
          maxTokens: chatConfig.maxTokens,
        });
      }, 3, 2000);
      provider = "openai";
    } else if (hasAnthropic) {
      result = await streamText({
        model: anthropic("claude-3-haiku-20240307"),
        system: systemPrompt + bibleContext,
        messages: messages,
        temperature: chatConfig.temperature,
        maxTokens: chatConfig.maxTokens,
      });
      provider = "anthropic";
    } else {
      throw new Error("No AI provider configured. Please set GROQ_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.");
    }

    console.log(`Response served via ${provider}`);

    // Use toDataStreamResponse for Vercel AI SDK format with CORS headers
    const response = result.toDataStreamResponse();
    
    // Add CORS headers to the streaming response
    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    
  } catch (error: any) {
    console.error("Chat API error:", error);
    
    // Provide more helpful error messages
    let errorMessage = "An error occurred while processing your request.";
    let statusCode = 500;
    
    const errorMsg = error?.message || "";
    if (errorMsg.includes("rate limit") || errorMsg.includes("Rate limit") || errorMsg.includes("429") || errorMsg.includes("quota")) {
      errorMessage = "The AI service is currently busy. Please wait a moment and try again.";
      statusCode = 429;
    } else if (errorMsg.includes("API key") || errorMsg.includes("Unauthorized") || errorMsg.includes("401")) {
      errorMessage = "AI service configuration error. Please contact support.";
      statusCode = 503;
    } else if (errorMsg.includes("No AI provider")) {
      errorMessage = errorMsg;
      statusCode = 503;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: statusCode, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "ok" }), { 
    status: 200, 
    headers: { "Content-Type": "application/json", ...corsHeaders } 
  });
}
