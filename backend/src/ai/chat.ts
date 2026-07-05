// src/ai/chat.ts — Chat session logic
import { AIGateway } from './gateway';
import { PromptBuilder } from './prompt';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  goal?: string;
  level?: string;
  history: ChatMessage[];
  message: string;
}

export async function runChat(
  gateway: AIGateway,
  options: ChatOptions,
): Promise<string> {
  const systemPrompt = await PromptBuilder.build('chat', {
    goal: options.goal ?? 'general learning',
    level: options.level ?? 'intermediate',
    history: options.history
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n'),
    message: options.message,
  });

  const messages: ChatMessage[] = [
    { role: 'user', content: systemPrompt },
  ];

  return gateway.chat(messages);
}
