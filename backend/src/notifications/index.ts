// src/notifications/index.ts — In-app notification stub
import { supabase } from '../config/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
): Promise<void> {
  await supabase.from('notifications').insert({ user_id: userId, type, title, body, read: false });
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as Notification[];
}

export async function markRead(notificationId: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', notificationId);
}
