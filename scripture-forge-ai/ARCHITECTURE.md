# ScriptureForge AI - Architecture & Implementation Guide

## 1. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                  PRESENTATION LAYER                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │   Home     │  │   Bible    │  │    Chat    │  │ Devotional │  │  Profile   │ │
│  │   Page     │  │   Reader   │  │  Interface │  │            │  │            │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│                                                                                   │
│  Components: shadcn/ui + Framer Motion | State: Zustand + React Query            │
└──────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                    Next.js 15
                                    App Router
                                         │
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                  APPLICATION LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            API Routes (/api/*)                              │ │
│  │  • /api/chat - AI conversation with streaming                               │ │
│  │  • /api/bible/* - Bible content (chapters, verses, search)                  │ │
│  │  • /api/auth/* - Authentication (NextAuth.js)                               │ │
│  │  • /api/webhooks/stripe - Payment processing                                │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Server Actions                                 │ │
│  │  • User preferences, bookmarks, notes, highlights                           │ │
│  │  • Reading progress tracking                                                │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
                                         │
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                   DOMAIN LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Prompt     │  │     RAG      │  │    Bible     │  │    Subscription      │ │
│  │  Templates   │  │   Search     │  │    Service   │  │      Service         │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
                                         │
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               INFRASTRUCTURE LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  PostgreSQL  │  │   Pinecone   │  │   OpenAI /   │  │       Stripe         │ │
│  │  (Drizzle)   │  │  Vector DB   │  │   Claude     │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## 2. AI Chat Flow (RAG Pipeline)

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. SAFETY CHECK                                                  │
│    - Check for harmful patterns                                  │
│    - Validate query intent                                       │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. QUERY CLASSIFICATION                                          │
│    - Verse explanation?                                          │
│    - Devotional request?                                         │
│    - Topic exploration?                                          │
│    - Character study?                                            │
│    - General Q&A?                                                │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. RAG RETRIEVAL                                                 │
│    - Generate query embedding (text-embedding-3-small)           │
│    - Search Pinecone for relevant verses                         │
│    - Return top-k most similar passages                          │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. PROMPT CONSTRUCTION                                           │
│    - System prompt (ScriptureForge AI persona)                   │
│    - Query-type specific instructions                            │
│    - Retrieved verse context                                     │
│    - User's original question                                    │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. LLM GENERATION                                                │
│    - Stream response from GPT-4o / Claude                        │
│    - Include scripture citations                                 │
│    - Maintain pastoral, educational tone                         │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
Streamed Response to User
```

## 3. Database Schema Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    accounts     │     │    sessions     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │◄────│ userId          │     │ sessionToken    │
│ email           │     │ provider        │     │ userId          │◄──┐
│ name            │     │ providerAccountId│    │ expires         │   │
│ subscriptionTier│     └─────────────────┘     └─────────────────┘   │
│ preferences     │                                                    │
└────────┬────────┘                                                    │
         │                                                             │
         │ 1:N                                                         │
         ▼                                                             │
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│   bookmarks     │     │   highlights    │     │     notes       │   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤   │
│ userId          │     │ userId          │     │ userId          │───┘
│ verseId         │     │ verseId         │     │ verseId         │
│ reference       │     │ color           │     │ content         │
│ note            │     └─────────────────┘     │ tags            │
└─────────────────┘                             └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ chatConversations│    │  chatMessages   │
├─────────────────┤     ├─────────────────┤
│ id              │◄────│ conversationId  │
│ userId          │     │ role            │
│ title           │     │ content         │
│ createdAt       │     │ metadata        │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│  subscriptions  │     │  usageTracking  │
├─────────────────┤     ├─────────────────┤
│ userId          │     │ userId          │
│ stripeId        │     │ date            │
│ status          │     │ aiQueriesCount  │
│ tier            │     │ wordsGenerated  │
└─────────────────┘     └─────────────────┘
```

## 4. Key File Locations

| Purpose | File Path |
|---------|-----------|
| **Home Page** | `app/page.tsx` |
| **Bible Reader** | `app/bible/page.tsx`, `components/bible/bible-reader.tsx` |
| **AI Chat** | `app/chat/page.tsx`, `components/chat/chat-interface.tsx` |
| **Chat API** | `app/api/chat/route.ts` |
| **Prompt Engineering** | `lib/prompt-templates.ts` |
| **RAG System** | `lib/rag.ts` |
| **Database Schema** | `lib/db/schema.ts` |
| **Authentication** | `lib/auth.ts` |
| **Offline Storage** | `lib/offline-storage.ts` |
| **State Management** | `lib/stores/bible-store.ts` |

## 5. Security & Ethics Implementation

### Authentication Flow
```
User → NextAuth.js → Google OAuth / Magic Link → Session → Protected Routes
                                                      ↓
                                                 Middleware checks
                                                      ↓
                                            Access granted/denied
```

### AI Safety Checks
1. **Input Validation**: Block harmful patterns before processing
2. **System Prompt**: Enforce balanced, scripture-based responses
3. **Output Monitoring**: Log responses for quality assurance
4. **Rate Limiting**: Prevent abuse (20 requests/minute default)

### Data Privacy
- All data encrypted at rest (database-level)
- HTTPS enforced for all traffic
- User data export/deletion capabilities
- No third-party data sharing

## 6. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Vercel Edge                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Next.js Application                   │   │
│  │  • Static pages (ISR)                                    │   │
│  │  • API Routes (Serverless Functions)                     │   │
│  │  • Middleware (Edge Runtime)                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Supabase    │    │   Pinecone    │    │    OpenAI     │
│  PostgreSQL   │    │   Vectors     │    │   GPT-4o      │
└───────────────┘    └───────────────┘    └───────────────┘
```

## 7. Performance Optimizations

1. **React Server Components**: Reduce client-side JavaScript
2. **Streaming Responses**: Show AI output progressively
3. **IndexedDB Caching**: Offline Bible access
4. **Image Optimization**: Next.js automatic optimization
5. **Code Splitting**: Dynamic imports for large components
6. **Edge Caching**: Static content at CDN edge

## 8. Monitoring & Analytics

- **Vercel Analytics**: Core web vitals, page views
- **Error Tracking**: Console errors, API failures
- **AI Usage**: Token consumption, response quality
- **User Engagement**: Session duration, feature usage

## 9. Cost Optimization Strategies

1. **Caching**: Cache frequent queries to reduce API calls
2. **Model Selection**: Use smaller models for simple queries
3. **Rate Limiting**: Prevent runaway costs from abuse
4. **Batch Processing**: Combine multiple embeddings
5. **CDN**: Leverage edge caching for static content
