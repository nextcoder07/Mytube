-- Migration: add priority columns to goals and backfill from JSON description

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS priority1 text,
  ADD COLUMN IF NOT EXISTS priority2 text,
  ADD COLUMN IF NOT EXISTS priority3 text;

-- Backfill simple JSON-serialized description values into the new columns when possible
UPDATE public.goals
SET
  priority1 = (CASE WHEN description IS NOT NULL AND description LIKE '{%' THEN (description::json ->> 'priority1') ELSE priority1 END),
  priority2 = (CASE WHEN description IS NOT NULL AND description LIKE '{%' THEN (description::json ->> 'priority2') ELSE priority2 END),
  priority3 = (CASE WHEN description IS NOT NULL AND description LIKE '{%' THEN (description::json ->> 'priority3') ELSE priority3 END)
WHERE description IS NOT NULL AND description LIKE '{%';
