/**
 * RAG (Retrieval-Augmented Generation) for ScriptureForge AI
 * 
 * This module handles:
 * 1. Vector embedding of Bible verses
 * 2. Semantic search for relevant verses
 * 3. Context building for AI responses
 */

// Check if APIs are configured
const isOpenAIConfigured = !!process.env.OPENAI_API_KEY;
const isPineconeConfigured = !!process.env.PINECONE_API_KEY && !!process.env.PINECONE_INDEX;

// Lazy-load clients only when needed and configured
let openaiClient: any = null;
let pineconeClient: any = null;

async function getOpenAI() {
  if (!isOpenAIConfigured) return null;
  if (!openaiClient) {
    const OpenAI = (await import("openai")).default;
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

async function getPineconeClient() {
  if (!isPineconeConfigured) return null;
  if (!pineconeClient) {
    const { Pinecone } = await import("@pinecone-database/pinecone");
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
  }
  return pineconeClient;
}

/**
 * Generate embedding for a text query
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  const openai = await getOpenAI();
  if (!openai) return null;
  
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Search for relevant Bible verses using vector similarity
 */
export async function searchRelevantVerses(
  query: string,
  topK: number = 5
): Promise<string[]> {
  try {
    // Check if Pinecone and OpenAI are configured
    if (!isPineconeConfigured || !isOpenAIConfigured) {
      // Fall back to keyword-based search if not configured
      return fallbackVerseSearch(query);
    }

    const client = await getPineconeClient();
    if (!client) return fallbackVerseSearch(query);
    
    const index = client.index(process.env.PINECONE_INDEX);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) return fallbackVerseSearch(query);

    // Search Pinecone
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    // Extract and format verses
    const verses = results.matches
      ?.filter((match: any) => match.score && match.score > 0.7)
      .map((match: any) => {
        const metadata = match.metadata as {
          reference: string;
          text: string;
          translation: string;
        };
        return `${metadata.reference} (${metadata.translation}): "${metadata.text}"`;
      }) || [];

    return verses.length > 0 ? verses : fallbackVerseSearch(query);
  } catch (error) {
    console.error("RAG search error:", error);
    return fallbackVerseSearch(query);
  }
}

/**
 * Fallback keyword-based verse search when vector DB is unavailable
 */
function fallbackVerseSearch(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  
  // Common verse associations for fallback
  const verseDatabase: Record<string, string[]> = {
    love: [
      'John 3:16 (ESV): "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."',
      '1 Corinthians 13:4-7 (ESV): "Love is patient and kind; love does not envy or boast; it is not arrogant or rude."',
      '1 John 4:19 (ESV): "We love because he first loved us."',
    ],
    hope: [
      'Jeremiah 29:11 (ESV): "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope."',
      'Romans 15:13 (ESV): "May the God of hope fill you with all joy and peace in believing."',
      'Hebrews 11:1 (ESV): "Now faith is the assurance of things hoped for, the conviction of things not seen."',
    ],
    faith: [
      'Hebrews 11:1 (ESV): "Now faith is the assurance of things hoped for, the conviction of things not seen."',
      'Romans 10:17 (ESV): "So faith comes from hearing, and hearing through the word of Christ."',
      'James 2:17 (ESV): "So also faith by itself, if it does not have works, is dead."',
    ],
    anxiety: [
      'Philippians 4:6-7 (ESV): "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God."',
      '1 Peter 5:7 (ESV): "Casting all your anxieties on him, because he cares for you."',
      'Matthew 6:34 (ESV): "Therefore do not be anxious about tomorrow, for tomorrow will be anxious for itself."',
    ],
    strength: [
      'Philippians 4:13 (ESV): "I can do all things through him who strengthens me."',
      'Isaiah 40:31 (ESV): "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles."',
      'Psalm 46:1 (ESV): "God is our refuge and strength, a very present help in trouble."',
    ],
    forgiveness: [
      'Ephesians 4:32 (ESV): "Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you."',
      'Colossians 3:13 (ESV): "Bearing with one another and, if one has a complaint against another, forgiving each other."',
      '1 John 1:9 (ESV): "If we confess our sins, he is faithful and just to forgive us our sins."',
    ],
    peace: [
      'John 14:27 (ESV): "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you."',
      'Philippians 4:7 (ESV): "And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus."',
      'Isaiah 26:3 (ESV): "You keep him in perfect peace whose mind is stayed on you, because he trusts in you."',
    ],
    salvation: [
      'Romans 10:9 (ESV): "If you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved."',
      'Ephesians 2:8-9 (ESV): "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God."',
      'Acts 4:12 (ESV): "And there is salvation in no one else, for there is no other name under heaven given among men by which we must be saved."',
    ],
    wisdom: [
      'James 1:5 (ESV): "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him."',
      'Proverbs 9:10 (ESV): "The fear of the Lord is the beginning of wisdom, and the knowledge of the Holy One is insight."',
      'Colossians 2:3 (ESV): "In whom are hidden all the treasures of wisdom and knowledge."',
    ],
    prayer: [
      'Matthew 6:9-13 (ESV): "Pray then like this: Our Father in heaven, hallowed be your name..."',
      'Philippians 4:6 (ESV): "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God."',
      '1 Thessalonians 5:17 (ESV): "Pray without ceasing."',
    ],
  };

  // Find matching topics
  const matchedVerses: string[] = [];
  for (const [topic, verses] of Object.entries(verseDatabase)) {
    if (lowerQuery.includes(topic)) {
      matchedVerses.push(...verses);
    }
  }

  // If no specific matches, return some foundational verses
  if (matchedVerses.length === 0) {
    return [
      'John 3:16 (ESV): "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."',
      'Romans 8:28 (ESV): "And we know that for those who love God all things work together for good, for those who are called according to his purpose."',
      'Psalm 23:1 (ESV): "The Lord is my shepherd; I shall not want."',
    ];
  }

  return matchedVerses.slice(0, 5);
}

/**
 * Index a Bible verse into the vector database
 * Used for initial setup and adding new translations
 */
export async function indexVerse(
  reference: string,
  text: string,
  translation: string,
  book: string,
  chapter: number,
  verse: number
): Promise<void> {
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
    throw new Error("Pinecone not configured");
  }

  const client = await getPineconeClient();
  const index = client.index(process.env.PINECONE_INDEX);

  // Generate embedding
  const embedding = await generateEmbedding(`${reference}: ${text}`);

  // Create unique ID
  const id = `${translation}-${book}-${chapter}-${verse}`.toLowerCase().replace(/\s+/g, "-");

  // Upsert to Pinecone
  await index.upsert([
    {
      id,
      values: embedding,
      metadata: {
        reference,
        text,
        translation,
        book,
        chapter,
        verse,
      },
    },
  ]);
}

/**
 * Batch index multiple verses
 */
export async function batchIndexVerses(
  verses: Array<{
    reference: string;
    text: string;
    translation: string;
    book: string;
    chapter: number;
    verse: number;
  }>
): Promise<void> {
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) {
    throw new Error("Pinecone not configured");
  }

  const client = await getPineconeClient();
  const index = client.index(process.env.PINECONE_INDEX);

  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);
    
    // Generate embeddings for batch
    const embeddings = await Promise.all(
      batch.map(async (v) => {
        const embedding = await generateEmbedding(`${v.reference}: ${v.text}`);
        const id = `${v.translation}-${v.book}-${v.chapter}-${v.verse}`
          .toLowerCase()
          .replace(/\s+/g, "-");
        
        return {
          id,
          values: embedding,
          metadata: {
            reference: v.reference,
            text: v.text,
            translation: v.translation,
            book: v.book,
            chapter: v.chapter,
            verse: v.verse,
          },
        };
      })
    );

    await index.upsert(embeddings);
    
    // Small delay to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
