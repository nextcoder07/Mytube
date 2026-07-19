-- Database Schema for MyTube - Personalized Learning Platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table if not exists public.users (
  id varchar(255) primary key, -- Firebase UID
  email varchar(255) not null unique,
  display_name varchar(255),
  photo_url text,
  role varchar(50) default 'user'::varchar, -- 'user', 'admin'
  subscription varchar(50) default 'free'::varchar, -- 'free', 'premium'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROFILES TABLE
create table if not exists public.profiles (
  id varchar(255) primary key references public.users(id) on delete cascade,
  bio text,
  location varchar(255),
  website text,
  learning_style varchar(50) default 'mixed'::varchar, -- 'visual', 'reading', 'mixed'
  daily_goal_minutes integer default 30 not null,
  streak integer default 0 not null,
  total_xp integer default 0 not null,
  user_youtube_api_keys text,
  user_github_api_keys text
);

-- GOALS TABLE
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  title varchar(255) not null,
  description text,
  category varchar(100),
  difficulty varchar(50) default 'beginner'::varchar, -- 'beginner', 'intermediate', 'advanced'
  target_date date,
  priority1 text,
  priority2 text,
  priority3 text,
  status varchar(50) default 'active'::varchar, -- 'active', 'completed', 'paused'
  use_in_search boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CONTENT TABLE
create table if not exists public.content (
  id varchar(255) primary key, -- Normalized ID (e.g. youtube video ID, github repo full name, md5 of url)
  title text not null,
  url text not null unique,
  source varchar(50) not null, -- 'youtube', 'github', 'reddit', 'medium', 'website'
  type varchar(50) not null, -- 'video', 'article', 'repo', 'post', 'course'
  thumbnail text,
  description text,
  author varchar(255),
  duration integer, -- in seconds (for videos)
  difficulty varchar(50),
  summary text,
  tags text[] default '{}'::text[] not null,
  language varchar(50) default 'en'::varchar not null,
  metadata jsonb default '{}'::jsonb not null,
  view_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROADMAPS (LEARNING PATHS) TABLE
create table if not exists public.learning_paths (
  id uuid default uuid_generate_v4() primary key,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  title varchar(255) not null,
  description text,
  phases jsonb default '[]'::jsonb not null, -- Array of phases: [{title, duration, topics[], resources[]}]
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SEARCH HISTORY TABLE
create table if not exists public.search_history (
  id uuid default uuid_generate_v4() primary key,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  query text not null,
  providers text[] default '{}'::text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CHATS TABLE
create table if not exists public.chats (
  id uuid default uuid_generate_v4() primary key,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  title varchar(255) default 'New Chat'::varchar not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MESSAGES TABLE
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  role varchar(50) not null, -- 'user', 'assistant'
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PLAYLISTS TABLE
create table if not exists public.playlists (
  id uuid default uuid_generate_v4() primary key,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  title varchar(255) not null,
  description text,
  is_public boolean default false not null,
  ai_generated boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PLAYLIST ITEMS TABLE
create table if not exists public.playlist_items (
  id uuid default uuid_generate_v4() primary key,
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  content_id varchar(255) not null references public.content(id) on delete cascade,
  position integer not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(playlist_id, content_id)
);

-- NOTES TABLE
create table if not exists public.notes (
  id uuid default uuid_generate_v4() primary key,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  content_id varchar(255) references public.content(id) on delete set null,
  title varchar(255),
  body text not null,
  tags text[] default '{}'::text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SUMMARIES CACHE TABLE
create table if not exists public.summaries (
  content_id varchar(255) primary key references public.content(id) on delete cascade,
  summary text not null,
  key_points jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ANALYTICS TABLE
create table if not exists public.analytics (
  id uuid default uuid_generate_v4() primary key,
  user_id varchar(255) references public.users(id) on delete cascade,
  event_type varchar(100) not null,
  event_data jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RECOMMENDATIONS TABLE
create table if not exists public.recommendations (
  id uuid default uuid_generate_v4() primary key,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  content_id varchar(255) not null references public.content(id) on delete cascade,
  score numeric(5,2) not null, -- rating score or weight
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, content_id)
);

-- WATCH HISTORY TABLE
create table if not exists public.watch_history (
  id uuid default uuid_generate_v4() primary key,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  content_id varchar(255) not null references public.content(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  watched_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists watch_history_user_id_idx on public.watch_history(user_id);
create index if not exists watch_history_watched_at_idx on public.watch_history(watched_at desc);

