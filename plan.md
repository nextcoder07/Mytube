# 🎯 MYTUBE — Personalized Learning Platform
### Complete Project Plan & Architecture Document

> **API-first architecture.** The backend controls everything. The frontend never talks directly to AI or any external service. Every external call is routed exclusively through the Express backend.

---

## 📋 Table of Contents

1. [Vision & Goals](#1-vision--goals)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [API Routes](#6-api-routes)
7. [Provider System](#7-provider-system)
8. [AI Gateway](#8-ai-gateway)
9. [Search Service](#9-search-service)
10. [Authentication Flow](#10-authentication-flow)
11. [Middleware Stack](#11-middleware-stack)
12. [Caching Strategy](#12-caching-strategy)
13. [Background Jobs](#13-background-jobs)
14. [Frontend Pages](#14-frontend-pages)
15. [API Response Standard](#15-api-response-standard)
16. [Storage](#16-storage)
17. [External Connections](#17-external-connections)
18. [Environment Variables](#18-environment-variables)
19. [Deployment Strategy](#19-deployment-strategy)
20. [Implementation Phases](#20-implementation-phases)

---

## 1. Vision & Goals

**Mytube** is a personalized learning platform that aggregates content from across the internet (YouTube, GitHub, Reddit, Medium, websites) and layers AI-powered features on top — chat, roadmaps, summaries, playlists, and recommendations.

### Core Principles

| Principle | Description |
|---|---|
| **API-First** | Backend is the brain. Frontend is just a display layer. |
| **AI-Aware** | Every AI call is routed through a single AI Gateway — never called directly from the frontend |
| **Content-Agnostic** | All external content normalizes into one `Content` object, regardless of source |
| **Provider-Extensible** | Add a new content source (Instagram, X, Substack) by adding one provider — nothing else changes |
| **Cost-Efficient** | Cache AI results aggressively. Never call AI twice for the same thing. |

---

## 2. System Architecture

```
                        User
                          │
               Website / Mobile App
                          │
                          ▼
               ┌──────────────────────┐
               │   Next.js Frontend   │
               │  (React, TypeScript, │
               │  Tailwind, Shadcn)   │
               └──────────┬───────────┘
                          │  HTTPS API calls only
                          ▼
               ┌──────────────────────┐
               │   Express Backend    │
               │  (Node.js, TS)       │
               └──────┬───────────────┘
                      │
      ┌───────────────┼────────────────────┐
      │               │                    │
      ▼               ▼                    ▼
┌──────────┐  ┌──────────────┐   ┌─────────────────┐
│ Firebase │  │  Supabase    │   │  Search Engine  │
│   Auth   │  │  PostgreSQL  │   │  (Providers)    │
└──────────┘  └──────────────┘   └────────┬────────┘
      │               │                   │
      ▼               ▼                   ▼
 User Auth       User Data          Provider Manager
                                          │
                              ┌───────────┼───────────┐
                              ▼           ▼           ▼
                          YouTube      GitHub      Reddit
                              │
                              ▼
                       AI Gateway
                              │
              ┌───────────────┼──────────────┐
              ▼               ▼              ▼
          Gemini API     OpenRouter      Future AI
```

### Request Flow

```
Frontend
  ↓
API Request (HTTPS)
  ↓
Express Router
  ↓
Middleware (Auth → Rate Limiter → Validator → Logger)
  ↓
Controller  (thin — delegates immediately)
  ↓
Service     (all business logic lives here)
  ↓
Database / Cache / Provider / AI   (as needed)
  ↓
Return JSON
```

---

## 3. Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 14** | App Router, SSR/SSG, routing |
| **React 18** | Component model |
| **TypeScript** | Type safety across the entire frontend |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn UI** | Pre-built accessible component library |
| **Zustand** | Lightweight global state management |
| **React Query (TanStack)** | Server state, caching, background refetch |
| **Axios** | HTTP client (calls only the backend) |
| **React Hook Form + Zod** | Form handling and validation |
| **Framer Motion** | Page transitions and micro-animations |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express.js** | HTTP framework |
| **TypeScript** | Type safety |
| **Supabase** | PostgreSQL + Storage |
| **Firebase Admin SDK** | Verify Firebase ID tokens server-side |
| **Redis** | Caching layer (sessions, AI results, search) |
| **BullMQ** | Job queue for background tasks |
| **Zod** | Request body validation |
| **Winston** | Structured logging |
| **Helmet** | Security headers |
| **express-rate-limit** | Rate limiting |

---

## 4. Project Structure

### 4.1 Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── index.ts              # Central config (reads from .env)
│   │   ├── firebase.ts           # Firebase Admin SDK init
│   │   ├── supabase.ts           # Supabase client init
│   │   └── redis.ts              # Redis client init
│   │
│   ├── middleware/
│   │   ├── auth.ts               # Verify Firebase token, attach user
│   │   ├── admin.ts              # Require admin role
│   │   ├── premium.ts            # Require premium subscription
│   │   ├── logger.ts             # Winston request logging
│   │   ├── rateLimiter.ts        # Per-route rate limits
│   │   ├── errorHandler.ts       # Global error handler
│   │   ├── validate.ts           # Zod schema validation
│   │   └── cors.ts               # CORS config
│   │
│   ├── routes/
│   │   ├── index.ts              # Mount all routers
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── goals.routes.ts
│   │   ├── search.routes.ts
│   │   ├── feed.routes.ts
│   │   ├── playlist.routes.ts
│   │   ├── notes.routes.ts
│   │   ├── summary.routes.ts
│   │   ├── ai.routes.ts
│   │   └── analytics.routes.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── goals.controller.ts
│   │   ├── search.controller.ts
│   │   ├── feed.controller.ts
│   │   ├── playlist.controller.ts
│   │   ├── notes.controller.ts
│   │   ├── summary.controller.ts
│   │   ├── ai.controller.ts
│   │   └── analytics.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── goals.service.ts
│   │   ├── search.service.ts
│   │   ├── feed.service.ts
│   │   ├── playlist.service.ts
│   │   ├── notes.service.ts
│   │   ├── summary.service.ts
│   │   ├── analytics.service.ts
│   │   └── recommendation.service.ts
│   │
│   ├── providers/
│   │   ├── index.ts              # ProviderManager class
│   │   ├── base.provider.ts      # Abstract base provider interface
│   │   ├── youtube/
│   │   │   ├── index.ts
│   │   │   ├── search.ts
│   │   │   ├── fetch.ts
│   │   │   └── normalize.ts
│   │   ├── github/
│   │   │   ├── index.ts
│   │   │   ├── search.ts
│   │   │   ├── fetch.ts
│   │   │   └── normalize.ts
│   │   ├── reddit/
│   │   │   ├── index.ts
│   │   │   ├── search.ts
│   │   │   ├── fetch.ts
│   │   │   └── normalize.ts
│   │   ├── medium/
│   │   │   ├── index.ts
│   │   │   ├── search.ts
│   │   │   ├── fetch.ts
│   │   │   └── normalize.ts
│   │   └── website/
│   │       ├── index.ts
│   │       ├── scrape.ts
│   │       └── normalize.ts
│   │
│   ├── ai/
│   │   ├── gateway.ts            # THE single point of entry for all AI calls
│   │   ├── chat.ts               # Chat session logic
│   │   ├── summary.ts            # Summarization logic
│   │   ├── roadmap.ts            # Roadmap generation
│   │   ├── playlist.ts           # AI playlist curation
│   │   ├── prompt.ts             # Prompt template loader/injector
│   │   └── memory.ts             # Conversation history management
│   │
│   ├── database/
│   │   ├── index.ts
│   │   ├── schema.sql            # Full Supabase schema
│   │   ├── migrations/
│   │   └── queries/
│   │       ├── users.ts
│   │       ├── content.ts
│   │       ├── chats.ts
│   │       └── ...
│   │
│   ├── cache/
│   │   ├── index.ts              # Redis wrapper
│   │   ├── keys.ts               # Typed cache key builders
│   │   └── ttl.ts                # TTL constants
│   │
│   ├── jobs/
│   │   ├── index.ts              # BullMQ setup, queue definitions
│   │   ├── summary.job.ts
│   │   ├── embeddings.job.ts
│   │   ├── recommendations.job.ts
│   │   ├── emails.job.ts
│   │   ├── analytics.job.ts
│   │   └── notifications.job.ts
│   │
│   ├── search/
│   │   ├── index.ts              # SearchService orchestrator
│   │   ├── merge.ts              # Merge + deduplicate results
│   │   └── rank.ts               # Score + sort results
│   │
│   ├── recommendation/
│   │   └── index.ts
│   │
│   ├── analytics/
│   │   └── index.ts
│   │
│   ├── notifications/
│   │   └── index.ts
│   │
│   ├── storage/
│   │   └── index.ts
│   │
│   ├── models/
│   │   ├── content.model.ts      # Content interface (universal)
│   │   ├── user.model.ts
│   │   ├── goal.model.ts
│   │   ├── chat.model.ts
│   │   ├── playlist.model.ts
│   │   ├── note.model.ts
│   │   └── analytics.model.ts
│   │
│   ├── auth/
│   │   └── firebase.auth.ts
│   │
│   └── utils/
│       ├── response.ts           # Standard API response builder
│       ├── errors.ts             # Custom error classes
│       ├── logger.ts             # Winston logger instance
│       └── helpers.ts
│
├── prompts/
│   ├── chat.txt
│   ├── summary.txt
│   ├── roadmap.txt
│   ├── playlist.txt
│   └── recommendation.txt
│
├── .env.example
├── package.json
└── tsconfig.json
```

### 4.2 Frontend Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── dashboard/page.tsx
│   │   ├── search/page.tsx
│   │   ├── feed/page.tsx
│   │   ├── chat/page.tsx
│   │   ├── playlist/page.tsx
│   │   ├── notes/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   │
│   ├── components/
│   │   ├── ui/                   # Shadcn UI components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── content/
│   │   │   ├── ContentCard.tsx
│   │   │   ├── ContentGrid.tsx
│   │   │   └── ContentDetail.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   └── SearchResults.tsx
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── ChatMessage.tsx
│   │   │   └── ChatInput.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSearch.ts
│   │   ├── useChat.ts
│   │   └── useFeed.ts
│   │
│   ├── lib/
│   │   ├── api.ts                # Axios instance (points to backend ONLY)
│   │   ├── firebase.ts           # Firebase client (auth only)
│   │   └── queryClient.ts
│   │
│   ├── store/
│   │   ├── auth.store.ts
│   │   └── ui.store.ts
│   │
│   └── types/
│       ├── content.ts
│       ├── user.ts
│       └── api.ts
│
├── public/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 5. Database Schema

All tables live in **Supabase PostgreSQL**.

> **Core Rule:** There is no `youtube_videos` table. No `github_repos` table. Everything is `content`.

### `users`
```sql
id            UUID PRIMARY KEY        -- Firebase UID
email         TEXT UNIQUE NOT NULL
display_name  TEXT
photo_url     TEXT
role          TEXT DEFAULT 'user'     -- user | admin
subscription  TEXT DEFAULT 'free'    -- free | premium
created_at    TIMESTAMPTZ DEFAULT NOW()
updated_at    TIMESTAMPTZ DEFAULT NOW()
```

### `profiles`
```sql
id                  UUID PRIMARY KEY REFERENCES users(id)
bio                 TEXT
location            TEXT
website             TEXT
learning_style      TEXT               -- visual | reading | mixed
daily_goal_minutes  INT DEFAULT 30
streak              INT DEFAULT 0
total_xp            INT DEFAULT 0
```

### `goals`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
title        TEXT NOT NULL
description  TEXT
category     TEXT
difficulty   TEXT                     -- beginner | intermediate | advanced
target_date  DATE
status       TEXT DEFAULT 'active'   -- active | completed | paused
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### `content` — The Universal Content Table
```sql
id           UUID PRIMARY KEY
title        TEXT NOT NULL
url          TEXT UNIQUE NOT NULL
source       TEXT NOT NULL            -- youtube | github | reddit | medium | website
type         TEXT NOT NULL            -- video | article | repo | post | course
thumbnail    TEXT
description  TEXT
author       TEXT
duration     INT                      -- seconds (videos)
difficulty   TEXT
summary      TEXT                     -- AI-generated, cached here
tags         TEXT[]
language     TEXT DEFAULT 'en'
metadata     JSONB                    -- source-specific extras
view_count   INT DEFAULT 0
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### `playlists`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
title        TEXT NOT NULL
description  TEXT
is_public    BOOLEAN DEFAULT FALSE
ai_generated BOOLEAN DEFAULT FALSE
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### `playlist_items`
```sql
id           UUID PRIMARY KEY
playlist_id  UUID REFERENCES playlists(id)
content_id   UUID REFERENCES content(id)
position     INT
added_at     TIMESTAMPTZ DEFAULT NOW()
```

### `notes`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
content_id   UUID REFERENCES content(id)  -- optional link
title        TEXT
body         TEXT
tags         TEXT[]
created_at   TIMESTAMPTZ DEFAULT NOW()
updated_at   TIMESTAMPTZ DEFAULT NOW()
```

### `chats`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
goal_id      UUID REFERENCES goals(id)    -- optional context
title        TEXT
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### `messages`
```sql
id           UUID PRIMARY KEY
chat_id      UUID REFERENCES chats(id)
role         TEXT NOT NULL               -- user | assistant
content      TEXT NOT NULL
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### `search_history`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
query        TEXT NOT NULL
providers    TEXT[]
result_count INT
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### `watch_history`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
content_id   UUID REFERENCES content(id)
progress_pct INT DEFAULT 0              -- 0-100
watched_at   TIMESTAMPTZ DEFAULT NOW()
```

### `saved_items`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
content_id   UUID REFERENCES content(id)
saved_at     TIMESTAMPTZ DEFAULT NOW()
```

### `summaries`
```sql
id           UUID PRIMARY KEY
content_id   UUID REFERENCES content(id)
summary_text TEXT NOT NULL
key_points   TEXT[]
model_used   TEXT                       -- gemini-pro | gpt-4 | etc.
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### `learning_paths`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
goal_id      UUID REFERENCES goals(id)
roadmap      JSONB NOT NULL             -- AI-generated roadmap structure
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### `analytics`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
event        TEXT NOT NULL              -- search | view | save | chat | etc.
metadata     JSONB
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### `recommendations`
```sql
id           UUID PRIMARY KEY
user_id      UUID REFERENCES users(id)
content_id   UUID REFERENCES content(id)
score        FLOAT
reason       TEXT
created_at   TIMESTAMPTZ DEFAULT NOW()
```

### Entity Relationships

```
User
 ├── Profile (1:1)
 ├── Goals (1:N)
 │    └── LearningPaths (1:N)
 ├── Playlists (1:N)
 │    └── PlaylistItems → Content
 ├── Chats (1:N)
 │    └── Messages (1:N)
 ├── Notes (1:N) → Content
 ├── WatchHistory (1:N) → Content
 ├── SavedItems (1:N) → Content
 ├── SearchHistory (1:N)
 ├── Recommendations → Content
 └── Analytics (1:N)
```

---

## 6. API Routes

### Standard Response Envelope

Every API response uses this shape:

```json
// Success
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "error": null
}

// Error
{
  "success": false,
  "message": "Something went wrong",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "..."
  }
}
```

---

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Verify Firebase token, create DB record |
| `POST` | `/auth/login` | ❌ | Verify Firebase ID token, return session |
| `POST` | `/auth/logout` | ✅ | Invalidate session |
| `GET` | `/auth/me` | ✅ | Return current user |

#### POST `/auth/register` body
```json
{ "idToken": "firebase-id-token", "displayName": "John Doe" }
```

---

### User

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/user` | ✅ | Get full user profile |
| `PUT` | `/user` | ✅ | Update profile fields |
| `DELETE` | `/user` | ✅ | Delete account |

---

### Goals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/goals` | ✅ | List all user goals |
| `POST` | `/goals` | ✅ | Create new goal |
| `PUT` | `/goals/:id` | ✅ | Update goal |
| `DELETE` | `/goals/:id` | ✅ | Delete goal |

#### POST `/goals` body
```json
{
  "title": "Learn Machine Learning",
  "category": "technology",
  "difficulty": "intermediate",
  "targetDate": "2025-12-31"
}
```

---

### Search

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/search` | ✅ | Standard multi-provider search |
| `POST` | `/search/ai` | ✅ | AI-enhanced search with ranking |
| `GET` | `/search/history` | ✅ | User's search history |

#### GET `/search` query params
```
q          — search query (required)
providers  — comma-separated: youtube,github,reddit,medium
type       — video | article | repo | all
page       — default 1
limit      — default 20
```

---

### Feed

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/feed` | ✅ | Personalized feed based on goals + history |
| `GET` | `/feed/recommended` | ✅ | AI-recommended content |

---

### Playlist

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/playlist` | ✅ | List user playlists |
| `POST` | `/playlist` | ✅ | Create playlist |
| `GET` | `/playlist/:id` | ✅ | Get playlist with all items |
| `POST` | `/playlist/:id/items` | ✅ | Add item to playlist |
| `DELETE` | `/playlist/:id` | ✅ | Delete playlist |

---

### Notes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notes` | ✅ | List all notes |
| `POST` | `/notes` | ✅ | Create note |
| `PUT` | `/notes/:id` | ✅ | Update note |
| `DELETE` | `/notes/:id` | ✅ | Delete note |

---

### Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/summary` | ✅ | Generate or fetch cached summary |
| `GET` | `/summary/:id` | ✅ | Get summary by ID |

#### POST `/summary` body
```json
{ "contentId": "uuid", "url": "https://youtube.com/watch?v=..." }
```

---

### AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/chat` | ✅ | Send message, get AI response |
| `POST` | `/roadmap` | ✅ | Generate learning roadmap for a goal |
| `POST` | `/recommendation` | ✅ | Get AI content recommendations |
| `POST` | `/playlist-ai` | ✅ | Generate AI-curated playlist |

#### POST `/chat` body
```json
{
  "chatId": "uuid-or-null",
  "goalId": "uuid-or-null",
  "message": "Explain backpropagation"
}
```

#### POST `/roadmap` body
```json
{
  "goalId": "uuid",
  "currentLevel": "beginner",
  "timeAvailableWeekly": 10
}
```

---

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/analytics` | ✅ | User learning analytics summary |
| `POST` | `/analytics/event` | ✅ | Track an event |

---

## 7. Provider System

The **Provider Manager** is the heart of the backend. Every content source implements the same interface.

### ContentProvider Interface

```typescript
interface ContentProvider {
  name: string
  search(query: string, options: SearchOptions): Promise<Content[]>
  fetch(id: string): Promise<Content>
  metadata(id: string): Promise<Record<string, unknown>>
  normalize(raw: unknown): Content
}
```

### Universal Content Object

```typescript
interface Content {
  id: string
  title: string
  url: string
  source: 'youtube' | 'github' | 'reddit' | 'medium' | 'website'
  type: 'video' | 'article' | 'repo' | 'post' | 'course'
  thumbnail?: string
  description?: string
  author?: string
  duration?: number         // seconds
  difficulty?: string
  summary?: string
  tags: string[]
  language: string
  metadata: Record<string, unknown>   // source-specific extras
  createdAt: Date
}
```

### Provider Manager

```typescript
class ProviderManager {
  private providers: Map<string, ContentProvider>

  register(provider: ContentProvider): void
  searchAll(query: string, options: SearchOptions): Promise<Content[]>
  searchSelected(providers: string[], query: string): Promise<Content[]>
  fetch(source: string, id: string): Promise<Content>
}
```

### Provider Flow

```
User Search: "machine learning python"
        ↓
ProviderManager.searchSelected(['youtube', 'github'])
        ↓
┌─────────────────────────────────────┐
│  Run in parallel (Promise.allSettled) │
│  YouTubeProvider.search(query)        │
│  GitHubProvider.search(query)         │
└─────────────────────────────────────┘
        ↓
Each provider: normalize raw → Content[]
        ↓
SearchService.merge(results)   → deduplicate by URL
SearchService.rank(merged)     → score by relevance + freshness
        ↓
Store new content records in DB
Return to controller
```

### Providers

| Provider | API Used | Content Type |
|---|---|---|
| **YouTube** | YouTube Data API v3 | `video` |
| **GitHub** | GitHub REST API | `repo` |
| **Reddit** | Reddit JSON API | `post` |
| **Medium** | Web scraping (cheerio) | `article` |
| **Website** | Open Graph + cheerio | `article` |

---

## 8. AI Gateway

The **AI Gateway** is the **only** component allowed to call external AI APIs. No controller, service, or provider calls Gemini directly.

### Gateway Interface

```typescript
class AIGateway {
  async generate(prompt: string, options?: AIOptions): Promise<string>
  async chat(messages: Message[], options?: AIOptions): Promise<string>
}
```

### Switching AI Providers

```typescript
// gateway.ts
const provider = config.aiProvider   // 'gemini' | 'openrouter'

if (provider === 'gemini') {
  return await callGemini(prompt, options)
} else {
  return await callOpenRouter(prompt, options)
}
```

Setting `AI_PROVIDER=openrouter` in `.env` switches the entire AI backend instantly — no other code changes needed.

---

### AI Feature Flows

#### Summary (cache-first)
```
POST /summary
  ↓
Check DB summaries table
  ├── FOUND → return immediately (free, instant)
  └── NOT FOUND
        ↓
      Check Redis
        ├── HIT → return + persist to DB
        └── MISS
              ↓
            Build prompt from content metadata
              ↓
            AIGateway.generate(prompt)
              ↓
            Store in DB + Redis
              ↓
            Return
```

#### Chat (with memory)
```
POST /chat
  ↓
Fetch goal context (if goalId provided)
Fetch last N messages from DB
  ↓
PromptBuilder.build('chat', { goal, history, message })
  ↓
AIGateway.chat(messages)
  ↓
Store user message + AI response in messages table
  ↓
Return AI response
```

#### Roadmap
```
POST /roadmap
  ↓
Fetch goal details + user profile (level, style, time)
  ↓
PromptBuilder.build('roadmap', { goal, level, timeAvailable })
  ↓
AIGateway.generate(prompt)
  ↓
Parse JSON response → structured roadmap
Store in learning_paths table
  ↓
Return roadmap
```

---

### Prompt Templates

Prompts are loaded from `.txt` files, not hardcoded in TypeScript.

**`prompts/chat.txt`**
```
You are a personalized learning assistant for a user working toward: {{goal}}.
Current level: {{level}}.

Previous conversation:
{{history}}

User: {{message}}

Respond helpfully and suggest resources where appropriate.
```

**`prompts/roadmap.txt`**
```
Create a structured learning roadmap for:
Goal: {{goal}}
Level: {{level}}
Time: {{timePerWeek}} hours/week
Target: {{targetDate}}

Return as JSON: { phases: [{ title, duration, topics[], resources[] }] }
```

**`prompts/summary.txt`**
```
Summarize this content for a learner:
Title: {{title}}
Description: {{description}}
URL: {{url}}

Provide: summary (3-5 sentences), key_points (5 bullet points).
Return as JSON.
```

---

## 9. Search Service

```
SearchService
    ↓
ProviderManager.searchSelected(providers, query)
    ↓
[YouTube, GitHub, Reddit, Medium] in parallel
    ↓
Each: search() → normalize() → Content[]
    ↓
merge.ts — deduplicate by URL
    ↓
rank.ts  — score each item by:
           ● Query relevance (keyword match)
           ● Freshness (recency score)
           ● Popularity (views/stars/upvotes)
           ● User interest match (based on goals)
    ↓
Sort DESC by score
    ↓
If POST /search/ai:
    └── Send top 20 to AIGateway
        └── Gemini re-ranks + explains each result
            └── Return re-ranked results with explanations
    ↓
Store query in search_history
Store new content in content table
Return to frontend
```

---

## 10. Authentication Flow

```
1. User clicks "Sign in with Google" on Frontend
        ↓
2. Firebase SDK handles OAuth entirely (client-side)
        ↓
3. Firebase returns an ID Token to the Frontend
        ↓
4. Frontend sends ID Token to backend:
   POST /auth/login  { idToken: "..." }
        ↓
5. Backend verifies with Firebase Admin SDK:
   admin.auth().verifyIdToken(idToken)
        ↓
6. Extract uid, email, displayName from decoded token
        ↓
7. Check Supabase DB:
   ├── User EXISTS → fetch record
   └── User NOT EXISTS → create record (first login)
        ↓
8. Generate backend session JWT
        ↓
9. Return { user, token } to Frontend
        ↓
10. Frontend stores token (memory / httpOnly cookie)
    All future requests: Authorization: Bearer <token>
```

---

## 11. Middleware Stack

```
Incoming Request
  ↓
cors()           — Allow configured frontend origin
  ↓
helmet()         — Security headers (XSS, HSTS, etc.)
  ↓
express.json()   — Parse JSON body
  ↓
logger()         — Log method, path, IP, timing
  ↓
rateLimiter()    — Throttle by IP / user
  ↓
auth()           — Verify JWT, attach req.user
  ↓
validate()       — Zod schema validation (per route)
  ↓
Controller
  ↓
errorHandler()   — Catch all errors, return standard response
```

### Rate Limits

| Endpoint Group | Limit |
|---|---|
| `/auth/*` | 10 req / minute |
| `/search` | 30 req / minute |
| `/chat` | 20 req / minute |
| `/summary` | 10 req / minute |
| General | 100 req / minute |

---

## 12. Caching Strategy

Redis cache-aside pattern: check cache first, fall through to DB/AI on miss.

| Cache Key | TTL | Contents |
|---|---|---|
| `search:{query}:{providers}` | 15 min | Search results |
| `summary:{contentId}` | 7 days | AI-generated summary |
| `roadmap:{goalId}` | 24 hrs | Generated roadmap JSON |
| `feed:{userId}` | 10 min | Personalized feed |
| `recommendation:{userId}` | 1 hr | AI recommendations |
| `session:{userId}` | 7 days | Session token |
| `ratelimit:{ip}` | 1 min | Rate limit counter |

---

## 13. Background Jobs

BullMQ manages all heavy work. No user request ever waits for AI generation.

| Queue | Trigger | Description |
|---|---|---|
| `summary` | Content added | Pre-generate summaries for new content |
| `embeddings` | Content added | Create vector embeddings (semantic search) |
| `recommendations` | Daily cron | Refresh recommendations for all users |
| `emails` | User events | Welcome emails, streak reminders, digests |
| `analytics` | Every 5 min | Batch-write analytics events to DB |
| `notifications` | User events | In-app and push notifications |

---

## 14. Frontend Pages

> All pages call the backend API only. Zero direct AI or external API calls from the frontend.

| Route | Page | Key Features |
|---|---|---|
| `/` | **Landing** | Hero, feature highlights, CTA |
| `/dashboard` | **Dashboard** | Today's goal, streak, recent content, AI next-item suggestion |
| `/search` | **Search** | Multi-provider bar, provider toggles, Standard/AI mode toggle, results grid |
| `/feed` | **Feed** | Infinite scroll, source badges, quick-save, quick-note |
| `/chat` | **AI Chat** | Session list, chat bubbles, goal context selector, markdown rendering |
| `/playlist` | **Playlists** | Playlist grid, create (manual/AI), ordered item list |
| `/notes` | **Notes** | Split-pane editor, markdown, link to content, flashcard generation |
| `/progress` | **Progress** | XP, streak, goal completion, weekly time chart |
| `/profile` | **Profile** | Avatar, bio, stats, public playlists |
| `/settings` | **Settings** | Notifications, theme toggle, provider visibility, account deletion |

---

## 15. API Response Standard

```typescript
// utils/response.ts

function success<T>(data: T, message = 'Success') {
  return { success: true, message, data, error: null }
}

function error(message: string, code: string, details?: unknown) {
  return { success: false, message, data: null, error: { code, details } }
}
```

### HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized |
| `403` | Forbidden (role/plan) |
| `404` | Not Found |
| `429` | Rate Limited |
| `500` | Internal Server Error |

---

## 16. Storage

Supabase Storage buckets:

| Bucket | Contents | Access |
|---|---|---|
| `profile-images` | User avatars | Public read, auth write |
| `ai-audio` | AI-generated audio (TTS, future) | Auth only |
| `attachments` | Note file attachments | Auth only |
| `exports` | Exported roadmaps, playlists (PDF/JSON) | Auth only |

---

## 17. External Connections

| Service | Used For | Method |
|---|---|---|
| **Firebase Authentication** | User identity, social login | `firebase-admin` SDK |
| **Supabase PostgreSQL** | Primary database | `@supabase/supabase-js` |
| **Supabase Storage** | File storage | `@supabase/supabase-js` |
| **Google Gemini API** | AI generation (primary) | `@google/generative-ai` |
| **OpenRouter** | Multi-model AI (fallback) | REST API |
| **YouTube Data API v3** | Video search + metadata | REST API |
| **GitHub REST API** | Repository search | REST API |
| **Reddit JSON API** | Post search | Public REST |
| **Redis** | Caching, sessions, rate limits | `ioredis` |
| **BullMQ** | Background job queue | `bullmq` |

---

## 18. Environment Variables

### Backend `.env.example`
```env
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-4o

# Content Providers
YOUTUBE_API_KEY=AIzaSy...
GITHUB_TOKEN=ghp_...
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### Frontend `.env.local.example`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:...
```

---

## 19. Deployment Strategy

### Local Development
```bash
# Terminal 1 — Backend (ts-node-dev hot reload)
cd backend && npm run dev            # port 4000

# Terminal 2 — Frontend (Next.js dev server)
cd frontend && npm run dev           # port 3000

# Terminal 3 — Redis
docker run -p 6379:6379 redis:alpine

# Terminal 4 — BullMQ worker
cd backend && npm run worker
```

### Production

| Service | Platform | Notes |
|---|---|---|
| **Frontend** | Vercel | Connect GitHub, auto-deploy on push |
| **Backend** | Railway or Render | Dockerfile or Node buildpack |
| **Redis** | Upstash | Serverless Redis — free tier available |
| **Database** | Supabase | Already cloud-hosted |
| **Storage** | Supabase | Already cloud-hosted |

---

## 20. Implementation Phases

### Phase 1 — Foundation
- [ ] Scaffold `backend/` (Express, TypeScript, folder structure)
- [ ] Firebase Admin middleware
- [ ] Supabase schema (`schema.sql`)
- [ ] Redis + BullMQ setup
- [ ] Response helpers (`success`, `error`)
- [ ] Auth routes: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`
- [ ] User routes: `GET/PUT/DELETE /user`

### Phase 2 — Content Engine
- [ ] `ContentProvider` interface + `ProviderManager`
- [ ] YouTube provider (search + normalize)
- [ ] GitHub provider (search + normalize)
- [ ] Reddit provider (search + normalize)
- [ ] `SearchService` (merge + rank)
- [ ] Routes: `GET /search`, `GET /search/history`

### Phase 3 — AI Integration
- [ ] AI Gateway (`gateway.ts`)
- [ ] Prompt template loader (`prompt.ts`)
- [ ] Summary service + routes (`POST /summary`, `GET /summary/:id`)
- [ ] Chat service + route (`POST /chat`)
- [ ] Roadmap service + route (`POST /roadmap`)
- [ ] AI search (`POST /search/ai`)
- [ ] Redis caching for all AI responses

### Phase 4 — User Features
- [ ] Goals routes (CRUD)
- [ ] Playlist routes (CRUD + items)
- [ ] Notes routes (CRUD)
- [ ] Feed service (`GET /feed`, `GET /feed/recommended`)
- [ ] Recommendation service (`POST /recommendation`)
- [ ] Analytics (`GET/POST /analytics`)

### Phase 5 — Frontend
- [ ] Next.js 14 scaffold + Tailwind + Shadcn UI
- [ ] Axios client pointing to backend only
- [ ] Firebase auth flow (client → backend)
- [ ] Landing, Dashboard, Search, Feed pages
- [ ] AI Chat, Playlist, Notes, Progress, Profile, Settings pages

### Phase 6 — Polish & Deploy
- [ ] BullMQ background workers
- [ ] Rate limiting per route
- [ ] Winston structured logging
- [ ] Error handling audit
- [ ] Docker Compose for local dev
- [ ] Deploy backend → Railway
- [ ] Deploy frontend → Vercel
- [ ] Configure env vars on both platforms

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| One universal `content` table | No schema churn when adding new providers |
| AI Gateway pattern | Swap Gemini → OpenRouter with one env var change |
| Firebase Auth + backend verify | Token never trusted client-side only; server validates |
| Cache AI results aggressively | Cost control — AI APIs charge per token |
| BullMQ for heavy tasks | User requests stay fast; AI work runs async |
| Prompt files (not hardcoded) | Improve prompts without a code deploy |
| ProviderManager as core abstraction | Add any content source with zero refactoring |

---

*Project: Mytube — Personalized Learning Platform*
*Last updated: July 2026*
