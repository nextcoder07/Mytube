-- Migration: Create watch_history table to store per-user watched content

CREATE TABLE IF NOT EXISTS public.watch_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id varchar(255) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_id varchar(255) NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.goals(id) ON DELETE SET NULL,
  watched_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index user_id for fast lookups per user
CREATE INDEX IF NOT EXISTS watch_history_user_id_idx ON public.watch_history(user_id);

-- Index watched_at desc for ordering history lists
CREATE INDEX IF NOT EXISTS watch_history_watched_at_idx ON public.watch_history(watched_at DESC);
