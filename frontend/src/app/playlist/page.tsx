'use client';
// frontend/src/app/playlist/page.tsx
import React from 'react';
import { QueueListIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function PlaylistPage() {
  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Playlists</h1>
          <p className="text-gray-400 mt-1">Organize your learning journey.</p>
        </div>
        <button id="create-playlist-btn" className="btn-neon flex items-center gap-2 px-4 py-2 text-sm">
          <PlusIcon className="w-4 h-4" />
          New Playlist
        </button>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
          <QueueListIcon className="w-8 h-8 text-violet-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">No playlists yet</h2>
        <p className="text-gray-400 text-sm mt-2 max-w-xs">
          Create a playlist manually or let AI curate one based on your goals.
        </p>
        <button className="mt-6 btn-neon px-6 py-2.5 text-sm">Create your first playlist</button>
      </div>
    </main>
  );
}
