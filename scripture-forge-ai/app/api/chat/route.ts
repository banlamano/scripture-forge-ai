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

// Language names for system prompt
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  de: "German",
  fr: "French",
  pt: "Portuguese",
  zh: "Chinese (Simplified)",
};

// Get system prompt with language instruction
function getSystemPrompt(lang: string = "en"): string {
  const languageName = LANGUAGE_NAMES[lang] || "English";
  const languageInstruction = lang !== "en" 
    ? `\n\nIMPORTANT: You MUST respond entirely in ${languageName}. All your explanations, context, and applications should be written in ${languageName}. When quoting Bible verses, use a ${languageName} translation if possible, or provide both the original and a ${languageName} translation.`
    : "";

  return `You are ScriptureForge AI, a knowledgeable and compassionate Bible study companion. 

IMPORTANT RULES:
1. Always cite Bible verses accurately with book, chapter, and verse numbers
2. When quoting scripture, use the exact text - do not paraphrase
3. Provide historical and cultural context when explaining passages
4. Be warm, encouraging, and pastoral in tone
5. If unsure about something, say so honestly
6. You are an AI assistant, not a replacement for pastoral care

When asked about a specific verse:
1. Quote the verse exactly
2. Explain its context (what comes before/after)
3. Provide historical background
4. Share practical application
5. Suggest related verses${languageInstruction}`;
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

export async function POST(req: Request) {
  try {
    const { messages, lang = "en" } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
    
    // Try Groq first (fastest), then OpenAI, then Anthropic
    if (hasGroq) {
      try {
        const groqClient = getGroqClient();
        result = await streamText({
          model: groqClient("llama-3.3-70b-versatile"),
          system: systemPrompt + bibleContext,
          messages: messages,
          temperature: 0.7,
          maxTokens: 2000,
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
                temperature: 0.7,
                maxTokens: 1000,
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
                temperature: 0.7,
                maxTokens: 1500,
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
            temperature: 0.7,
            maxTokens: 1500,
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
          temperature: 0.7,
          maxTokens: 1000,
        });
      }, 3, 2000);
      provider = "openai";
    } else if (hasAnthropic) {
      result = await streamText({
        model: anthropic("claude-3-haiku-20240307"),
        system: systemPrompt + bibleContext,
        messages: messages,
        temperature: 0.7,
        maxTokens: 1500,
      });
      provider = "anthropic";
    } else {
      throw new Error("No AI provider configured. Please set GROQ_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.");
    }

    console.log(`Response served via ${provider}`);

    // Use toDataStreamResponse for Vercel AI SDK format
    return result.toDataStreamResponse();
    
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
      { status: statusCode, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: "ok" }), { 
    status: 200, 
    headers: { "Content-Type": "application/json" } 
  });
}
