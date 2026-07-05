// src/analytics/index.ts — Analytics event tracker
import { supabase } from '../config/supabase';

export type AnalyticsEvent =
  | 'search'
  | 'view'
  | 'save'
  | 'chat'
  | 'playlist_create'
  | 'note_create'
  | 'goal_create'
  | 'login';

export async function trackEvent(
  userId: string,
  event: AnalyticsEvent,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await supabase.from('analytics').insert({ user_id: userId, event, metadata });
}

export async function getUserAnalytics(userId: string) {
  const { data, error } = await supabase
    .from('analytics')
    .select('event, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) return [];
  return data;
}
