// src/recommendation/index.ts — Recommendation engine stub
import { supabase } from '../config/supabase';
import { Content } from '../models/content.model';

export async function getRecommendations(userId: string, limit = 10): Promise<Content[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('content_id, score, reason, content(*)')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row: any) => row.content as Content);
}

export async function upsertRecommendation(
  userId: string,
  contentId: string,
  score: number,
  reason: string,
): Promise<void> {
  await supabase.from('recommendations').upsert({
    user_id: userId,
    content_id: contentId,
    score,
    reason,
  });
}
