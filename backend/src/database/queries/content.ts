// src/database/queries/content.ts — Content query helpers
import { supabase } from '../../config/supabase';
import { Content } from '../../models/content.model';

export async function upsertContent(content: Omit<Content, 'createdAt'>) {
  const { data, error } = await supabase
    .from('content')
    .upsert(
      {
        id: content.id,
        title: content.title,
        url: content.url,
        source: content.source,
        type: content.type,
        thumbnail: content.thumbnail,
        description: content.description,
        author: content.author,
        duration: content.duration,
        difficulty: content.difficulty,
        summary: content.summary,
        tags: content.tags,
        language: content.language,
        metadata: content.metadata,
      },
      { onConflict: 'url' },
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function findById(contentId: string) {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', contentId)
    .single();
  if (error) return null;
  return data;
}

export async function findByUrl(url: string) {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('url', url)
    .single();
  if (error) return null;
  return data;
}

export async function bulkUpsert(items: Omit<Content, 'createdAt'>[]) {
  return Promise.allSettled(items.map(upsertContent));
}
