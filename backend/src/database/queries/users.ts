// src/database/queries/users.ts — User query helpers
import { supabase } from '../../config/supabase';

export async function findById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*, profiles(*)')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function findByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  if (error) return null;
  return data;
}

export async function createUser(
  id: string,
  email: string,
  displayName?: string,
  photoUrl?: string,
) {
  const { data, error } = await supabase
    .from('users')
    .insert({ id, email, display_name: displayName, photo_url: photoUrl })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateUser(userId: string, fields: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteUser(userId: string) {
  await supabase.from('users').delete().eq('id', userId);
}
