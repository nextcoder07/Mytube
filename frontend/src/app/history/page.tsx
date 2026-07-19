'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlayerStore } from '@/store/player.store';
import { api } from '@/lib/api';
import ContentCard from '@/components/content/ContentCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ClockIcon, CalendarIcon, MagnifyingGlassIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Content } from '@/types/content';

interface WatchHistoryEntry {
  id: string;
  userId?: string;
  contentId?: string;
  watchedAt: string;
  goalId?: string;
  content: Content;
}

interface FeedHistoryEntry {
  id: string;
  openedAt: string;
  goalId?: string;
  content: Content;
}

interface SearchHistoryEntry {
  id: string;
  userId?: string;
  query: string;
  providers?: string | string[];
  resultsCount?: number;
  createdAt?: string;
  created_at?: string;
  goalId?: string;
  goal_id?: string;
}

function formatProviders(providers?: string) {
  if (!providers) return 'All providers';
  return providers
    .split(',')
    .map((provider) => provider.trim())
    .filter(Boolean)
    .map((provider) => provider.charAt(0).toUpperCase() + provider.slice(1))
    .join(', ');
}

export default function HistoryPage() {
  const { play } = usePlayerStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'watch' | 'feed' | 'goal' | 'search'>('watch');
  const [deletingSearchId, setDeletingSearchId] = useState<string | null>(null);
  const [clearingSearch, setClearingSearch] = useState(false);

  // Fetch watch history from DB
  const { data: watchHistory = [], isLoading: watchHistoryLoading } = useQuery<WatchHistoryEntry[]>({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      const res = await api.get('/history');
      return res.data?.data || [];
    },
  });

  // Fetch feed history from DB
  const { data: feedHistory = [], isLoading: feedHistoryLoading } = useQuery<FeedHistoryEntry[]>({
    queryKey: ['feedHistory'],
    queryFn: async () => {
      const res = await api.get('/history/feed');
      return res.data?.data || [];
    },
  });

  // Fetch search history from DB
  const { data: rawSearchHistory = [], isLoading: searchHistoryLoading } = useQuery<SearchHistoryEntry[]>({
    queryKey: ['searchHistory'],
    queryFn: async () => {
      const res = await api.get('/search/history');
      return res.data?.data || [];
    },
  });

  // Filter goal watch history
  const goalHistory = useMemo(() => {
    return watchHistory.filter((item) => item.goalId);
  }, [watchHistory]);

  const activeGoalCount = useMemo(() => {
    return new Set(goalHistory.map((item) => item.goalId).filter(Boolean)).size;
  }, [goalHistory]);

  const searchStats = useMemo(() => {
    const providers: Record<string, number> = {};
    rawSearchHistory.forEach((item) => {
      if (!item.providers) return;
      const list = Array.isArray(item.providers)
        ? item.providers
        : String(item.providers).split(',').map((p) => p.trim().toLowerCase());
      
      list.forEach((provider: string) => {
        if (!provider) return;
        providers[provider] = (providers[provider] || 0) + 1;
      });
    });
    return {
      totalSearches: rawSearchHistory.length,
      providerCounts: providers,
      mostRecent: rawSearchHistory[0],
    };
  }, [rawSearchHistory]);

  const latestSearchText = searchStats.mostRecent?.query;

  // Delete a single search history entry
  const handleDeleteSearchEntry = async (id: string) => {
    setDeletingSearchId(id);
    try {
      await api.delete(`/search/history/${id}`);
      queryClient.setQueryData<SearchHistoryEntry[]>(['searchHistory'], (prev) =>
        (prev || []).filter((item) => item.id !== id)
      );
      queryClient.invalidateQueries({ queryKey: ['searchHistoryDropdown'] });
    } catch (err) {
      console.error('Failed to delete search history entry:', err);
    } finally {
      setDeletingSearchId(null);
    }
  };

  // Clear all search history
  const handleClearAllSearch = async () => {
    setClearingSearch(true);
    try {
      await api.delete('/search/history');
      queryClient.setQueryData(['searchHistory'], []);
      queryClient.setQueryData(['searchHistoryDropdown'], []);
    } catch (err) {
      console.error('Failed to clear search history:', err);
    } finally {
      setClearingSearch(false);
    }
  };

  const isPageLoading = watchHistoryLoading || feedHistoryLoading || searchHistoryLoading;

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-violet-300">
          <ClockIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-white">History</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Review your goal-aligned watch activity, general watch history, feed opens, and search sessions. All history is stored per-user in the database.
        </p>
      </div>

      {/* Stats cards */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="glow-card p-5 border border-violet-700/40 bg-gray-950/70 rounded-3xl">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Watch history</p>
          <p className="text-3xl font-bold text-white mt-3">{watchHistory.length}</p>
          <p className="text-sm text-gray-400 mt-2">Total items watched</p>
        </div>

        <div className="glow-card p-5 border border-fuchsia-700/40 bg-gray-950/70 rounded-3xl">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Feed history</p>
          <p className="text-3xl font-bold text-white mt-3">{feedHistory.length}</p>
          <p className="text-sm text-gray-400 mt-2">Opened from feed</p>
          <div className="mt-4 text-sm text-gray-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Most recent</span>
              <span className="text-white font-semibold">
                {feedHistory.length > 0 ? new Date(feedHistory[0].openedAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="glow-card p-5 border border-cyan-700/40 bg-gray-950/70 rounded-3xl">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Search history</p>
          <p className="text-3xl font-bold text-white mt-3">{searchStats.totalSearches}</p>
          <p className="text-sm text-gray-400 mt-2">Past searches in database</p>
          <div className="mt-4 text-sm text-gray-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Latest search</span>
              <span className="text-white font-semibold truncate max-w-[140px]">
                {latestSearchText || '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="glow-card p-5 border border-indigo-700/40 bg-gray-950/70 rounded-3xl">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Quick links</p>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            <Link href="/feed" className="block rounded-2xl border border-gray-800 px-4 py-2 hover:border-violet-500 transition text-center">
              Continue goal feed
            </Link>
            <Link href="/search" className="block rounded-2xl border border-gray-800 px-4 py-2 hover:border-cyan-500 transition text-center">
              Open search page
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs selector */}
      <div className="flex border-b border-gray-800 gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('watch')}
          className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === 'watch' ? 'text-violet-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          📺 Watch History ({watchHistory.length})
          {activeTab === 'watch' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === 'feed' ? 'text-fuchsia-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          📡 Feed History ({feedHistory.length})
          {activeTab === 'feed' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-fuchsia-500 rounded" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('goal')}
          className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === 'goal' ? 'text-violet-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          🎯 Goal Feed History ({goalHistory.length})
          {activeTab === 'goal' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3 text-sm font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === 'search' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          🔍 Search History ({searchStats.totalSearches})
          {activeTab === 'search' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500 rounded" />
          )}
        </button>
      </div>

      {/* Main Content Areas */}
      {isPageLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Tab 1: All Watch History */}
          {activeTab === 'watch' && (
            <div className="space-y-4">
              {watchHistory.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400">
                  No watch history found. Start playing videos or learning content to build this timeline.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {watchHistory.map((entry) => (
                    <div key={entry.id} className="flex flex-col h-full bg-gray-950/40 rounded-3xl overflow-hidden border border-gray-800 p-2 group hover:border-violet-500/50 transition">
                      <div className="relative aspect-video rounded-2xl overflow-hidden">
                        <ContentCard
                          content={entry.content}
                          onClick={(c) => play(c, watchHistory.map((item) => item.content))}
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5 text-violet-400" />
                            {new Date(entry.watchedAt).toLocaleDateString()} at{' '}
                            {new Date(entry.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {entry.goalId && (
                            <span className="bg-violet-950/60 text-[10px] px-2 py-0.5 rounded border border-violet-500/20 text-violet-300 font-medium">
                              Goal Aligned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Feed History */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {feedHistory.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400">
                  No feed history found. Open content from your{' '}
                  <Link href="/feed" className="text-fuchsia-400 hover:text-fuchsia-300 underline">
                    Goal Feed
                  </Link>{' '}
                  to start building this history.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {feedHistory.map((entry) => (
                    <div key={entry.id} className="flex flex-col h-full bg-gray-950/40 rounded-3xl overflow-hidden border border-gray-800 p-2 group hover:border-fuchsia-500/50 transition">
                      <div className="relative aspect-video rounded-2xl overflow-hidden">
                        <ContentCard
                          content={entry.content}
                          onClick={(c) => play(c, feedHistory.map((item) => item.content))}
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5 text-fuchsia-400" />
                            {new Date(entry.openedAt).toLocaleDateString()} at{' '}
                            {new Date(entry.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {entry.goalId && (
                            <span className="bg-fuchsia-950/60 text-[10px] px-2 py-0.5 rounded border border-fuchsia-500/20 text-fuchsia-300 font-medium">
                              Goal Feed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Goal Feed History */}
          {activeTab === 'goal' && (
            <div className="space-y-4">
              {goalHistory.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400">
                  No goal-aligned watch history found. Watch content associated with your active learning goals to populate this list.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {goalHistory.map((entry) => (
                    <div key={entry.id} className="flex flex-col h-full bg-gray-950/40 rounded-3xl overflow-hidden border border-gray-800 p-2 group hover:border-violet-500/50 transition">
                      <div className="relative aspect-video rounded-2xl overflow-hidden">
                        <ContentCard
                          content={entry.content}
                          onClick={(c) => play(c, goalHistory.map((item) => item.content))}
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5 text-violet-400" />
                            {new Date(entry.watchedAt).toLocaleDateString()}
                          </span>
                          <span className="bg-violet-950/60 text-[10px] px-2 py-0.5 rounded border border-violet-500/20 text-violet-300 font-medium">
                            Goal Aligned
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Search History */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {rawSearchHistory.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400">
                  No saved searches found. Search for topics using the search bar to record query logs.
                </div>
              ) : (
                <>
                  {/* Clear all header */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleClearAllSearch}
                      disabled={clearingSearch}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors border border-gray-700 hover:border-red-500/50 px-4 py-2 rounded-xl disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                      {clearingSearch ? 'Clearing…' : 'Clear all search history'}
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {rawSearchHistory.map((item) => {
                      const providersText = Array.isArray(item.providers)
                        ? item.providers.join(', ')
                        : String(item.providers);
                      return (
                        <div key={item.id} className="rounded-3xl border border-gray-800 bg-gray-950/80 p-5 hover:border-cyan-500/30 transition flex flex-col justify-between group">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <MagnifyingGlassIcon className="h-4 w-4 text-cyan-400 shrink-0" />
                                <p className="text-base font-semibold text-white truncate">{item.query}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Providers: <span className="text-gray-300 font-medium">{formatProviders(providersText)}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {item.goal_id && (
                                <span className="rounded-full bg-violet-600/20 text-violet-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border border-violet-500/10">
                                  Goal
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteSearchEntry(item.id)}
                                disabled={deletingSearchId === item.id}
                                className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                title="Remove this search"
                                aria-label={`Remove "${item.query}" from search history`}
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {(() => {
                            const dateObj = new Date(item.created_at || item.createdAt || Date.now());
                            return (
                              <div className="mt-4 pt-3 border-t border-gray-900 flex justify-between items-center text-xs text-gray-500">
                                <span>
                                  Searched on {dateObj.toLocaleDateString()}
                                </span>
                                <span>
                                  {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
