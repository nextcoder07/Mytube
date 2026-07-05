// frontend/src/hooks/useChat.ts
import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export function useChat(chatId?: string, goalId?: string) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMsg = { role: 'user', content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      try {
        const res = await api.post('/chat', {
          chatId: chatId ?? null,
          goalId: goalId ?? null,
          message: text,
        });
        const reply: ChatMsg = { role: 'assistant', content: res.data.data.reply };
        setMessages((prev) => [...prev, reply]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Something went wrong. Please try again.' },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, goalId],
  );

  return { messages, isLoading, sendMessage };
}
