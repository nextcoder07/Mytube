'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/player.store';
import { useSearchStore } from '@/store/search.store';
import ContentCard from '@/components/content/ContentCard';
import { ClockIcon } from '@heroicons/react/24/outline';

function formatProviders(providers?: string) {
  if (!providers) return 'All providers';
  return providers
    .split(',')
    .map((provider) => provider.trim())
    .filter(Boolean)
    .map((provider) => provider.charAt(0).toUpperCase() + provider.slice(1))
    .join(', ');
}

function formatQueryFilters(params: { order?: string; videoDuration?: string; relevanceLanguage?: string; type?: string }) {
  const filters = [];
  if (params.order) filters.push(`Order: ${params.order}`);
  if (params.videoDuration && params.videoDuration !== 'any') filters.push(`Duration: ${params.videoDuration}`);
  if (params.relevanceLanguage) filters.push(`Language: ${params.relevanceLanguage}`);
  if (params.type) filters.push(`Type: ${params.type}`);
  return filters.join(' · ');
}

export default function HistoryPage() {
  const goalHistory = usePlayerStore((state) => state.goalHistory);
  const queryHistory = useSearchStore((state) => state.queryHistory);
  const currentSearch = useSearchStore((state) => state.params);

  const sortedGoalHistory = useMemo(
    () => [...goalHistory].sort((a, b) => new Date(b.watchedAt).getTime() - new Date(a.watchedAt).getTime()),
    [goalHistory]
  );

  const activeGoalCount = useMemo(() => {
    return new Set(goalHistory.map((entry) => entry.goalId).filter(Boolean)).size;
  }, [goalHistory]);

  const goalHistoryItems = sortedGoalHistory.slice(0, 12).map((entry) => entry.content);

  const searchStats = useMemo(() => {
    const providers: Record<string, number> = {};
    queryHistory.forEach((query) => {
      const list = query.providers?.split(',').map((p) => p.trim().toLowerCase()) || [];
      list.forEach((provider) => {
        if (!provider) return;
        providers[provider] = (providers[provider] || 0) + 1;
      });
    });
    return {
      totalSearches: queryHistory.length,
      providerCounts: providers,
      mostRecent: queryHistory[queryHistory.length - 1],
    };
  }, [queryHistory]);

  const latestSearchText = currentSearch?.q || searchStats.mostRecent?.q;

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-violet-300">
          <ClockIcon className="h-5 w-5" />
          <h1 className="text-2xl font-bold text-white">History</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Review your goal-aligned watch activity and search sessions. Goal history is preserved indefinitely, while search queries are stored for easy review and follow-up.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glow-card p-5 border border-violet-700/40 bg-gray-950/70">
          <p className="text-xs uppercase tracking-wide text-gray-500">Goal history</p>
          <p className="text-3xl font-bold text-white mt-3">{goalHistory.length}</p>
          <p className="text-sm text-gray-400 mt-2">Total goal-aligned items watched</p>
          <div className="mt-4 text-sm text-gray-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Goals represented</span>
              <span className="text-white font-semibold">{activeGoalCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recent watched</span>
              <span className="text-white font-semibold">{goalHistory.length > 0 ? new Date(sortedGoalHistory[0].watchedAt).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>
        <div className="glow-card p-5 border border-cyan-700/40 bg-gray-950/70">
          <p className="text-xs uppercase tracking-wide text-gray-500">Search history</p>
          <p className="text-3xl font-bold text-white mt-3">{searchStats.totalSearches}</p>
          <p className="text-sm text-gray-400 mt-2">Past searches available in history</p>
          <div className="mt-4 text-sm text-gray-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Latest search</span>
              <span className="text-white font-semibold truncate max-w-[140px]">{latestSearchText || '—'}</span>
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
        <div className="glow-card p-5 border border-indigo-700/40 bg-gray-950/70">
          <p className="text-xs uppercase tracking-wide text-gray-500">Quick links</p>
          <div className="mt-4 space-y-3 text-sm text-gray-300">
            <Link href="/feed" className="block rounded-2xl border border-gray-800 px-4 py-3 hover:border-violet-500 transition">
              Continue goal feed
            </Link>
            <Link href="/search" className="block rounded-2xl border border-gray-800 px-4 py-3 hover:border-cyan-500 transition">
              Open search page
            </Link>
            <Link href="/goals" className="block rounded-2xl border border-gray-800 px-4 py-3 hover:border-emerald-500 transition">
              Manage goals
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Goal history</p>
            <h2 className="text-xl font-semibold text-white">Recent goal-aligned watched content</h2>
          </div>
          {goalHistory.length > 0 && (
            <p className="text-xs text-gray-400">Showing {goalHistoryItems.length} of {goalHistory.length}</p>
          )}
        </div>
        {goalHistory.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400">
            No goal-aligned watch history yet. Play content from the goal feed to build this timeline.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-4 overflow-x-auto pb-3">
              {goalHistoryItems.map((entry) => (
                <div key={entry.id} className="min-w-[280px] flex-shrink-0">
                  <ContentCard content={entry} />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sortedGoalHistory.slice(0, 3).map((entry) => (
                <div key={`${entry.content.id}-${entry.content.createdAt}`} className="rounded-3xl border border-gray-800 bg-gray-950/80 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{entry.content.title.length > 40 ? `${entry.content.title.slice(0, 40)}...` : entry.content.title}</p>
                  <div className="mt-3 text-sm text-gray-300">
                    <p><span className="font-semibold text-white">Source:</span> {entry.content.source}</p>
                    <p className="mt-2"><span className="font-semibold text-white">Watched:</span> {new Date(entry.watchedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Search history</p>
            <h2 className="text-xl font-semibold text-white">Recent search queries</h2>
          </div>
          {queryHistory.length > 0 && (
            <p className="text-xs text-gray-400">Showing {Math.min(queryHistory.length, 8)} of {queryHistory.length}</p>
          )}
        </div>

        {queryHistory.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900/60 p-10 text-center text-gray-400">
            No saved searches yet. Search for a topic to start storing recent queries.
          </div>
        ) : (
          <div className="grid gap-4">
            {queryHistory.slice(-8).reverse().map((query, index) => (
              <div key={`${query.q}-${index}`} className="rounded-3xl border border-gray-800 bg-gray-950/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{query.q}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatProviders(query.providers)}</p>
                  </div>
                  {query.goalId && (
                    <span className="rounded-full bg-violet-600/20 text-violet-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider">
                      Goal
                    </span>
                  )}
                </div>
                {formatQueryFilters(query) ? (
                  <p className="mt-3 text-xs text-gray-400">{formatQueryFilters(query)}</p>
                ) : (
                  <p className="mt-3 text-xs text-gray-500">No additional filters used</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
