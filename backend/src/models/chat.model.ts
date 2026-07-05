// src/models/chat.model.ts
export interface Chat {
  id: string;
  userId: string;
  goalId?: string;
  title?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}
