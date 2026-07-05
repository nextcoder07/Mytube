// src/models/note.model.ts
export interface Note {
  id: string;
  userId: string;
  contentId?: string;
  title?: string;
  body: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
