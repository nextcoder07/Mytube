# Deployment & Environment Variables

This file lists exact environment variables and commands to deploy the Mytube app (backend → Render, frontend → Vercel) and to run locally.

## Backend (Render)

Required environment variables (set in Render service settings):

- `PORT` = `4000`
- `NODE_ENV` = `production`
- `FRONTEND_URL` = https://your-frontend-url.vercel.app
- `SUPABASE_URL` = Supabase → Settings → API → Project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Supabase → Settings → API → service_role key (SECRET)
- `FIREBASE_PROJECT_ID` = Firebase service account `project_id`
- `FIREBASE_CLIENT_EMAIL` = Firebase service account `client_email`
- `FIREBASE_PRIVATE_KEY` = Firebase service account `private_key` (paste with newlines escaped)
- `JWT_SECRET` = secure random string
- Optional: `REDIS_URL`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `YOUTUBE_API_KEY`, `GITHUB_TOKEN`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`

Notes for `FIREBASE_PRIVATE_KEY` on Render/Vercel:
- If copying the JSON private key, replace actual newlines with `\n` when pasting into the env value, or wrap the key in double quotes.

Commands Render will run (from `render.yaml` / Dockerfile):

Backend build happens in Dockerfile; Render uses `postinstall` to run `npm run build` as configured in `backend/package.json`.

Local backend run (developer):
```bash
cd backend
npm ci
# create .env from .env.example and fill secrets
npm run dev    # runs ts-node-dev (dev)
```

Seed helper (optional):
```bash
# after setting backend .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
cd backend
npm ci
npm run seed
```

## Frontend (Vercel)

Required environment variables (set in Vercel project settings):

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- (optional) `NEXT_PUBLIC_API_URL` to override backend base URL (default points to Render)

Local frontend run:
```bash
cd frontend
npm ci
# copy .env.example to .env.local and add the NEXT_PUBLIC_ keys
npm run dev
```

## Health & Status
- Backend exposes `/api/health` and `/api/status` (status checks Supabase connectivity and Firebase Admin readiness).
- Frontend includes `/status` page that displays the backend `/api/status` output.

## Quick Deploy Checklist
1. Push `main` to GitHub.
2. Connect repo to Render and import `render.yaml` (creates backend service).
3. Add backend env vars listed above in Render service settings.
4. Connect frontend to Vercel, add `NEXT_PUBLIC_*` env vars, and deploy.
5. Visit `https://<frontend>/status` to verify backend connectivity.

## Troubleshooting
- If `/api/status` shows Supabase connection error, ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct and that the DB allows connections.
- If Firebase Admin is not initialized, ensure `FIREBASE_PRIVATE_KEY` is fully pasted (with `\n` where necessary) and `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PROJECT_ID` match.

## Security
- Never commit real secrets into the repo. Use Render/Vercel UI or CLI to set env variables.
