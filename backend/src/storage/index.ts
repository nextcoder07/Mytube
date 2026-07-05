// src/storage/index.ts — Supabase Storage helper
import { supabase } from '../config/supabase';

export const Buckets = {
  PROFILE_IMAGES: 'profile-images',
  AI_AUDIO:       'ai-audio',
  ATTACHMENTS:    'attachments',
  EXPORTS:        'exports',
} as const;

export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer,
  contentType = 'application/octet-stream',
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}
