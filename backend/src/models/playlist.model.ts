// src/models/playlist.model.ts
export interface Playlist {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  aiGenerated: boolean;
  createdAt: Date;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  contentId: string;
  position: number;
  addedAt: Date;
}
