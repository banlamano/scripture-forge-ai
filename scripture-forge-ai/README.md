# ScriptureForge AI

> 🙏 Your AI-powered Bible study companion for deeper spiritual growth

ScriptureForge AI is a modern, production-ready Bible study web application featuring AI-powered chat, interactive Bible reading, personalized devotionals, and comprehensive study tools.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Home      │  │   Bible     │  │  AI Chat    │  │  Devotional/Journal │ │
│  │   Page      │  │   Reader    │  │  Interface  │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                │                │                    │            │
│         └────────────────┴────────────────┴────────────────────┘            │
│                                    │                                        │
│                        ┌───────────┴───────────┐                           │
│                        │  Zustand State Store  │                           │
│                        │  + React Query Cache  │                           │
│                        └───────────────────────┘                           │
│                                    │                                        │
│                        ┌───────────┴───────────┐                           │
│                        │    IndexedDB (idb)    │  ← Offline Bible Storage  │
│                        └───────────────────────┘                           │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTPS
┌────────────────────────────────────┴────────────────────────────────────────┐
│                           NEXT.JS 15 SERVER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        API Routes (/api/*)                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐│    │
│  │  │  /chat   │  │  /bible  │  │  /auth   │  │  /webhooks/stripe    ││    │
│  │  │          │  │          │  │          │  │                      ││    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────────────────┘│    │
│  └───────┼─────────────┼─────────────┼────────────────────────────────┘    │
│          │             │             │                                      │
│  ┌───────┴─────────────┴─────────────┴────────────────────────────────┐    │
│  │                      Server Components                              │    │
│  │                   + Server Actions (RSC)                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐      ┌─────────────────────┐      ┌─────────────────┐
│   PostgreSQL    │      │    AI Services      │      │   Pinecone      │
│   (Supabase/    │      │  ┌──────────────┐   │      │   Vector DB     │
│    Neon)        │      │  │ OpenAI GPT-4 │   │      │                 │
│                 │      │  │   or Claude  │   │      │  Bible Verse    │
│  - Users        │      │  └──────────────┘   │      │  Embeddings     │
│  - Notes        │      │         │           │      │  for RAG        │
│  - Bookmarks    │      │  ┌──────┴───────┐   │      │                 │
│  - Chat History │      │  │ Prompt       │   │      └─────────────────┘
│  - Subscriptions│      │  │ Engineering  │   │
└─────────────────┘      │  │ + Safety     │   │
                         │  └──────────────┘   │
                         └─────────────────────┘
```

## ✨ Features

### MVP (v1.0)
- [x] 📖 **Bible Reader** - Multiple translations, chapter navigation, verse selection
- [x] 💬 **AI Chat** - Scripture-grounded conversations with streaming responses
- [x] 🌟 **Verse of the Day** - Daily inspiring scripture with audio
- [x] 🔖 **Bookmarks & Highlights** - Save and organize favorite verses
- [x] 🌙 **Dark/Light Mode** - Beautiful, serene UI themes
- [x] 🔐 **Authentication** - Google OAuth + Email magic links
- [x] 📱 **Responsive Design** - Optimized for desktop and mobile

### Roadmap (v2.0+)
- [ ] 📅 Reading Plans - Structured Bible reading programs
- [ ] 🙏 Prayer Journal - Track prayers and answers
- [ ] 🔊 Audio Bible - Text-to-speech for all verses
- [ ] 🌍 Multi-language - 25+ language support
- [ ] 👥 Community - Group studies and discussions
- [ ] 📴 Offline Mode - Full PWA with offline Bible access
- [ ] 💳 Premium Subscriptions - Advanced features via Stripe

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router, RSC) |
| **UI** | React 18, Tailwind CSS, shadcn/ui, Framer Motion |
| **State** | Zustand, TanStack Query |
| **Database** | PostgreSQL (Supabase/Neon) + Drizzle ORM |
| **Auth** | NextAuth.js v5 (Auth.js) |
| **AI** | OpenAI GPT-4o / Anthropic Claude |
| **RAG** | Pinecone Vector DB + OpenAI Embeddings |
| **Payments** | Stripe Subscriptions |
| **Deployment** | Vercel |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or Supabase/Neon account)
- OpenAI API key (or Anthropic)
- (Optional) Pinecone account for RAG

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/scripture-forge-ai.git
cd scripture-forge-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
```

### Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-with-openssl-rand-base64-32"
OPENAI_API_KEY="sk-..."

# Optional but recommended
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
PINECONE_API_KEY="..."
STRIPE_SECRET_KEY="..."
```

### Database Setup

```bash
# Generate migrations
npm run db:generate

# Push to database
npm run db:push

# (Optional) Open Drizzle Studio
npm run db:studio
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
scripture-forge-ai/
├── app/                      # Next.js App Router
│   ├── (main)/              # Main app routes
│   │   ├── page.tsx         # Home page
│   │   ├── bible/           # Bible reader
│   │   ├── chat/            # AI chat interface
│   │   └── devotional/      # Devotionals
│   ├── api/                 # API routes
│   │   ├── chat/            # AI chat endpoint
│   │   └── auth/            # NextAuth handlers
│   └── auth/                # Auth pages
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── bible/               # Bible reader components
│   ├── chat/                # Chat components
│   ├── home/                # Home page components
│   ├── layout/              # Layout components
│   └── providers/           # Context providers
├── lib/
│   ├── db/                  # Database schema & client
│   ├── stores/              # Zustand stores
│   ├── auth.ts              # Auth configuration
│   ├── rag.ts               # RAG implementation
│   ├── prompt-templates.ts  # AI prompt engineering
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## 🔒 Security & Ethics

### Data Privacy
- All user data encrypted at rest
- GDPR compliant data handling
- No selling of personal data
- Users can export/delete their data

### AI Ethics
- Responses grounded in scripture citations
- Balanced theological perspectives
- Clear disclaimers about AI limitations
- Harmful query filtering
- Not a replacement for pastoral care

## 💰 Cost Estimates (MVP - 10K Users)

| Service | Monthly Cost |
|---------|-------------|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| OpenAI API (~50K queries) | $50-100 |
| Pinecone Starter | $0-70 |
| Domain + Misc | $15 |
| **Total** | **~$110-230/mo** |

## 📈 Scaling Considerations

- Implement Redis caching for frequent queries
- Use edge functions for global performance
- Add rate limiting per user tier
- Consider dedicated AI model hosting at scale
- Implement proper observability (logs, metrics)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

## 📜 License

MIT License - see LICENSE file

---

Built with ❤️ for the faith community
