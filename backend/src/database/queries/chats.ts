// src/database/queries/chats.ts — Chat/message query helpers
import { supabase } from '../../config/supabase';

export async function listChats(userId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select('id, title, created_at, goal_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data;
}

export async function createChat(userId: string, title: string, goalId?: string) {
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId, title, goal_id: goalId ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getMessages(chatId: string, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) return [];
  return data;
}

export async function addMessage(chatId: string, role: 'user' | 'assistant', content: string) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ chat_id: chatId, role, content })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
