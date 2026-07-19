'use client';
// frontend/src/app/playlist/page.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { PlusIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Playlist, Content, PlaylistItem } from '../../types/content';
import { usePlayerStore } from '../../store/player.store';

export default function PlaylistPage() {
  const { play } = usePlayerStore();
  const [watchLaterId, setWatchLaterId] = useState<string | null>(null);

  const { data: playlists = [], isLoading } = useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: async () => {
      const res = await api.get('/playlist');
      return res.data?.data || [];
    },
  });

  const { data: watchLaterPlaylistDetails } = useQuery<Playlist | null>({
    queryKey: ['playlist', watchLaterId],
    queryFn: async () => {
      if (!watchLaterId) return null;
      const res = await api.get(`/playlist/${watchLaterId}`);
      return res.data?.data || null;
    },
    enabled: !!watchLaterId,
  });

  useEffect(() => {
    const current = playlists.find((playlist) => playlist.title === 'Watch Later');
    setWatchLaterId(current?.id || null);
  }, [playlists]);

  const watchLaterPlaylist = useMemo(() => {
    return watchLaterPlaylistDetails || playlists.find((playlist) => playlist.title === 'Watch Later') || null;
  }, [playlists, watchLaterPlaylistDetails]);

  const removeFromWatchLater = async (contentId: string) => {
    if (!watchLaterId) return;
    await api.delete(`/playlist/${watchLaterId}/items/${contentId}`);
    window.location.reload();
  };

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Playlists</h1>
          <p className="text-gray-400 mt-1">Keep a permanent Watch Later list and organize your learning journey.</p>
        </div>
        <button id="create-playlist-btn" className="btn-neon flex items-center gap-2 px-4 py-2 text-sm">
          <PlusIcon className="w-4 h-4" />
          New Playlist
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-gray-800 bg-gray-900/60 p-10 text-center text-gray-400">Loading playlists…</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-800 bg-gray-900/60 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-violet-500/10 p-2 border border-violet-500/20">
                <ClockIcon className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Watch Later</h2>
                <p className="text-sm text-gray-400">This playlist is created for every user and can only have its items removed.</p>
              </div>
            </div>

            {watchLaterPlaylist?.items?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {watchLaterPlaylist.items.map((item: PlaylistItem) => (
                  <div key={item.content?.id || item.contentId} className="rounded-2xl border border-gray-800 bg-gray-950/70 p-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => play(item.content, watchLaterPlaylist.items?.map((entry: PlaylistItem) => entry.content).filter(Boolean) as Content[])}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-semibold text-white line-clamp-2">{item.content?.title || 'Untitled'}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.content?.author || item.content?.source}</p>
                    </button>
                    <button
                      onClick={() => removeFromWatchLater(item.content?.id || item.contentId)}
                      className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-red-400"
                      title="Remove from Watch Later"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-900/40 p-8 text-center text-sm text-gray-400">
                Nothing saved for later yet. Add items from the player or search results.
              </div>
            )}
          </div>

          {playlists.filter((playlist) => playlist.title !== 'Watch Later').length > 0 && (
            <div className="rounded-3xl border border-gray-800 bg-gray-900/60 p-5">
              <h2 className="text-lg font-semibold text-white mb-4">Other playlists</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playlists.filter((playlist) => playlist.title !== 'Watch Later').map((playlist) => (
                  <div key={playlist.id} className="rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
                    <p className="text-sm font-semibold text-white">{playlist.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{playlist.description || 'Custom playlist'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
