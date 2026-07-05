// src/ai/memory.ts — Conversation history management
import { supabase } from '../config/supabase';

export interface MemoryMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

/**
 * Fetch the last N messages for a chat session.
 */
export async function fetchHistory(chatId: string, limit = 20): Promise<MemoryMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.reverse() as MemoryMessage[];
}

/**
 * Persist a user or assistant message.
 */
export async function saveMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  await supabase.from('messages').insert({ chat_id: chatId, role, content });
}

/**
 * Create a new chat session and return its id.
 */
export async function createChat(
  userId: string,
  goalId: string | null,
  title: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('chats')
    .insert({ user_id: userId, goal_id: goalId, title })
    .select('id')
    .single();

  if (error || !data) throw new Error('Failed to create chat session');
  return data.id as string;
}
