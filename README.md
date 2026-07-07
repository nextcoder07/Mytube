# Mytube

> An AI-powered multi-platform content aggregation and learning platform.

## Architecture

```
┌──────────────────┐      HTTPS       ┌──────────────────┐
│  Netlify (SSR)   │ ───────────────▶ │   Render (API)   │
│  Next.js 15      │                  │   Express + TS   │
└──────────────────┘                  └────────┬─────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          ▼                    ▼                    ▼
                   ┌─────────────┐    ┌──────────────┐     ┌──────────────┐
                   │  Supabase   │    │   Firebase   │     │    Redis     │
                   │  (Postgres) │    │   (Auth)     │     │   (Cache)    │
                   └─────────────┘    └──────────────┘     └──────────────┘
```

| Layer        | Service   | Purpose                         |
| ------------ | --------- | ------------------------------- |
| **Frontend** | Netlify   | Next.js SSR / ISR hosting       |
| **Backend**  | Render    | Express REST API (Docker)       |
| **Database** | Supabase  | PostgreSQL + Vector search      |
| **Auth**     | Firebase  | User authentication (Admin SDK) |
| **Cache**    | Redis     | Caching & BullMQ job queues     |

---

## Local Development

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Redis (optional, for caching/jobs)

### 1. Clone & install

```bash
git clone https://github.com/nextcoder07/Mytube.git
cd Mytube
```

### 2. Backend

```bash
cd backend
cp .env.example .env          # fill in your real values
npm install
npm run dev                    # starts on http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local     # fill in your real values
npm install
npm run dev                    # starts on http://localhost:3000
```

---

## Deployment

### Frontend → Netlify

1. Go to [Netlify](https://app.netlify.com) → **New site from Git** → select **GitHub** → pick this repo.
2. Netlify will auto-detect `netlify.toml` and configure the build.
3. Add these **environment variables** in **Site Settings → Environment Variables**:

   | Variable                             | Value                                           |
   | ------------------------------------ | ----------------------------------------------- |
   | `NEXT_PUBLIC_API_URL`                | `https://mytube-backend.onrender.com/api`       |
   | `NEXT_PUBLIC_FIREBASE_API_KEY`       | Your Firebase API key                           |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`   | `your-project.firebaseapp.com`                  |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID`    | Your Firebase project ID                        |
   | `NEXT_PUBLIC_FIREBASE_APP_ID`        | Your Firebase app ID                            |

4. Trigger a deploy (or push to `main`).

### Backend → Render

1. Go to [Render](https://render.com) → **New** → **Blueprint** → connect this repo.
2. Render will auto-detect `render.yaml` and create the service.
3. Add these **secret environment variables** in the Render dashboard:

   | Variable                    | Where to get it                                      |
   | --------------------------- | ---------------------------------------------------- |
   | `FRONTEND_URL`              | Your Netlify URL (e.g. `https://mytube.netlify.app`) |
   | `SUPABASE_URL`              | Supabase → Settings → API                           |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API (service_role key)         |
   | `FIREBASE_PROJECT_ID`       | Firebase Console → Project Settings                  |
   | `FIREBASE_CLIENT_EMAIL`     | Firebase → Service Account JSON                      |
   | `FIREBASE_PRIVATE_KEY`      | Firebase → Service Account JSON (paste full key)     |
   | `GEMINI_API_KEY`            | Google AI Studio                                     |
   | `YOUTUBE_API_KEY`           | Google Cloud Console                                 |
   | `GITHUB_TOKEN`              | GitHub → Developer Settings → PAT                   |
   | `REDDIT_CLIENT_ID`          | Reddit → Apps → Create app                          |
   | `REDDIT_CLIENT_SECRET`      | Reddit → Apps → Create app                          |
   | `REDIS_URL`                 | Your Redis provider (e.g. Upstash, Render Redis)    |

4. Render will auto-deploy on every push to `main`.

### Database → Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the **URL** and **service_role key** from **Settings → API**.
3. Paste them into Render's environment variables.

## Start Database & Authentication (quick)

- To load the database schema, open Supabase → SQL Editor and run the SQL in `backend/src/database/schema.sql` (or copy-paste the contents).
- Alternatively, run the SQL locally using `psql` against your `DATABASE_URL` if you prefer CLI:

```bash
# Example (replace with your DATABASE_URL)
psql "$DATABASE_URL" -f backend/src/database/schema.sql
```

- For authentication, create a Firebase web app and a service account JSON. Add the `NEXT_PUBLIC_FIREBASE_*` keys to your frontend (Vercel/Netlify) and `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` to the backend (Render/Env).

- After schema and env vars are in place, deploy backend (Render) and frontend (Vercel). The backend will create user/profile records on first login.

### Auth → Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Google sign-in** under Authentication → Sign-in method.
3. Generate a **service account key** (JSON) from Project Settings → Service Accounts.
4. Copy `project_id`, `client_email`, and `private_key` into Render's env vars.
5. Copy the **web app config** (apiKey, authDomain, etc.) into Netlify's env vars.

---

## Secrets Management

> **Rule**: Real credentials are NEVER committed to the repository.

| File                       | Committed? | Purpose                              |
| -------------------------- | ---------- | ------------------------------------- |
| `backend/.env`             | ❌ No       | Local dev secrets                     |
| `backend/.env.example`     | ✅ Yes      | Template with placeholders            |
| `frontend/.env.local`      | ❌ No       | Local dev secrets                     |
| `frontend/.env.example`    | ✅ Yes      | Template with placeholders            |
| Netlify env vars           | N/A         | Frontend production secrets           |
| Render env vars            | N/A         | Backend production secrets            |

---

## Project Structure

```
Mytube/
├── netlify.toml             # Netlify build config
├── render.yaml              # Render Blueprint
├── .gitignore               # Root-level ignores
├── frontend/                # Next.js 15 (React 18)
│   ├── src/
│   ├── .env.example
│   ├── next.config.ts
│   └── package.json
└── backend/                 # Express + TypeScript
    ├── src/
    ├── Dockerfile
    ├── .dockerignore
    ├── .env.example
    └── package.json
```

---

## License

Private project.
