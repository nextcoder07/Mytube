'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/store/player.store';
import { useSearchStore } from '@/store/search.store';
import { api } from '@/lib/api';
import ContentCard from '@/components/content/ContentCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ClockIcon, CalendarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
  const [activeTab, setActiveTab] = useState<'watch' | 'goal' | 'search'>('watch');

  // Fetch watch history from DB
  const { data: watchHistory = [], isLoading: watchHistoryLoading } = useQuery({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      const res = await api.get('/history');
      return res.data?.data || [];
    },
  });

  // Fetch search history from DB
  const { data: rawSearchHistory = [], isLoading: searchHistoryLoading } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: async () => {
      const res = await api.get('/search/history');
      return res.data?.data || [];
    },
  });

  // Filter goal watch history
  const goalHistory = useMemo(() => {
    return watchHistory.filter((item: any) => item.goalId);
  }, [watchHistory]);

  const activeGoalCount = useMemo(() => {
    return new Set(goalHistory.map((item: any) => item.goalId).filter(Boolean)).size;
  }, [goalHistory]);

  const searchStats = useMemo(() => {
    const providers: Record<string, number> = {};
    rawSearchHistory.forEach((item: any) => {
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

  const isPageLoading = watchHistoryLoading || searchHistoryLoading;

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-violet-300">
          <ClockIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-white">History</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Review your goal-aligned watch activity, general watch history, and search sessions. Watch history is stored in the database for unified access.
        </p>
      </div>

      {/* Stats cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="glow-card p-5 border border-violet-700/40 bg-gray-950/70 rounded-3xl">
          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Goal history</p>
          <p className="text-3xl font-bold text-white mt-3">{goalHistory.length}</p>
          <p className="text-sm text-gray-400 mt-2">Total goal-aligned items watched</p>
          <div className="mt-4 text-sm text-gray-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Goals represented</span>
              <span className="text-white font-semibold">{activeGoalCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recent watched</span>
              <span className="text-white font-semibold">
                {goalHistory.length > 0 ? new Date(goalHistory[0].watchedAt).toLocaleDateString() : '—'}
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
            <div className="flex items-center justify-between">
              <span>Top provider</span>
              <span className="text-white font-semibold">
                {Object.entries(searchStats.providerCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([provider]) => provider.charAt(0).toUpperCase() + provider.slice(1))
                  .slice(0, 1)
                  .join(', ') || 'All'}
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
      <div className="flex border-b border-gray-800 gap-6">
        <button
          onClick={() => setActiveTab('watch')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'watch' ? 'text-violet-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          📺 Watch History ({watchHistory.length})
          {activeTab === 'watch' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('goal')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
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
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            activeTab === 'search' ? 'text-violet-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          🔍 Search History ({searchStats.totalSearches})
          {activeTab === 'search' && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500 rounded" />
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
                  No watch history found in the database. Start playing videos or learning content to build this timeline.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {watchHistory.map((entry: any) => (
                    <div key={entry.id} className="flex flex-col h-full bg-gray-950/40 rounded-3xl overflow-hidden border border-gray-800 p-2 group hover:border-violet-500/50 transition">
                      <div className="relative aspect-video rounded-2xl overflow-hidden">
                        <ContentCard
                          content={entry.content}
                          onClick={(c) => play(c, watchHistory.map((item: any) => item.content))}
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

          {/* Tab 2: Goal Feed History */}
          {activeTab === 'goal' && (
            <div className="space-y-4">
              {goalHistory.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400">
                  No goal-aligned watch history found. Watch content associated with your active learning goals to populate this list.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {goalHistory.map((entry: any) => (
                    <div key={entry.id} className="flex flex-col h-full bg-gray-950/40 rounded-3xl overflow-hidden border border-gray-800 p-2 group hover:border-violet-500/50 transition">
                      <div className="relative aspect-video rounded-2xl overflow-hidden">
                        <ContentCard
                          content={entry.content}
                          onClick={(c) => play(c, goalHistory.map((item: any) => item.content))}
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

          {/* Tab 3: Search History */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              {rawSearchHistory.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400">
                  No saved searches found. Search for topics using the search bar to record query logs.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {rawSearchHistory.map((item: any) => {
                    const providersText = Array.isArray(item.providers)
                      ? item.providers.join(', ')
                      : String(item.providers);
                    return (
                      <div key={item.id} className="rounded-3xl border border-gray-800 bg-gray-950/80 p-5 hover:border-violet-500/30 transition flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <MagnifyingGlassIcon className="h-4 w-4 text-violet-400 shrink-0" />
                              <p className="text-base font-semibold text-white">{item.query}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Providers: <span className="text-gray-300 font-medium">{formatProviders(providersText)}</span>
                            </p>
                          </div>
                          {item.goal_id && (
                            <span className="rounded-full bg-violet-600/20 text-violet-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border border-violet-500/10">
                              Goal
                            </span>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-900 flex justify-between items-center text-xs text-gray-500">
                          <span>
                            Searched on {new Date(item.created_at || item.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            {new Date(item.created_at || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
