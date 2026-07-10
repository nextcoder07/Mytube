'use client';
// frontend/src/app/feed/page.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ContentGrid from '../../components/content/ContentGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFeed } from '../../hooks/useFeed';
import { useGoals } from '../../hooks/useGoals';
import { usePlayerStore } from '../../store/player.store';

const providerOptions = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'github', label: 'GitHub' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'medium', label: 'Medium' },
  { id: 'devto', label: 'Dev.to' },
  { id: 'wikipedia', label: 'Wikipedia' },
  { id: 'website', label: 'Official Docs' },
];

export default function FeedPage() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(providerOptions.map((p) => p.id));
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const watchHistoryIds = usePlayerStore((state) => state.watchHistory.map((entry) => entry.content.id));
  const goalHistoryIds = usePlayerStore((state) => state.goalHistory.map((entry) => entry.content.id));
  const excludedIds = Array.from(new Set([...watchHistoryIds, ...goalHistoryIds]));

  const { goals, isLoading: goalsLoading } = useGoals();
  const activeGoals = goals.filter((goal) => goal.status === 'active');

  useEffect(() => {
    if (activeGoals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(activeGoals[0].id);
    }
  }, [activeGoals, selectedGoalId]);

  const { items, isLoading, error, loadMore, hasMore, isFetchingNextPage } = useFeed(
    false,
    selectedProviders,
    excludedIds,
    12,
    selectedGoalId ?? undefined,
    refreshKey
  );

  const hasGoals = activeGoals.length > 0;
  const focusedGoal = selectedGoalId ? activeGoals.find((goal) => goal.id === selectedGoalId) : null;
  const displayItems = items;
  const title = hasGoals ? 'Focused Goal Feed' : 'Create a Goal First';

  const toggleProvider = (providerId: string) => {
    setSelectedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  };

  const allProvidersSelected = selectedProviders.length === providerOptions.length;
  const clearProviderSelection = () => setSelectedProviders([]);
  const selectAllProviders = () => setSelectedProviders(providerOptions.map((p) => p.id));

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Goal Feed</h1>
          <p className="text-gray-400 mt-1">Only content aligned to your active goals, learning priorities, and goal progress.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Focus topic</span>
            <h2 className="text-lg font-semibold text-white mt-2">{focusedGoal ? focusedGoal.title : 'All active goals'}</h2>
            <p className="text-sm text-gray-400 mt-1">
              {focusedGoal
                ? focusedGoal.description || 'Focused on this goal to reduce distraction and keep the feed goal-aligned.'
                : 'Using all active goals for a broader goal feed. Pick one goal to stay more focused.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedGoalId(null)}
              className={`px-3 py-2 rounded-full text-xs font-semibold transition border ${
                !selectedGoalId
                  ? 'bg-violet-600 text-white border-violet-500'
                  : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
              }`}
            >
              All active goals
            </button>
            {activeGoals.map((goal) => {
              const active = selectedGoalId === goal.id;
              return (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition border ${
                    active
                      ? 'bg-violet-600 text-white border-violet-500'
                      : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                  }`}
                >
                  {goal.title}
                </button>
              );
            })}
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="px-3 py-2 rounded-full text-xs font-semibold bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition"
            >
              Refresh feed
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-gray-800 bg-gray-900/60 p-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Sources</span>
            <button
              onClick={allProvidersSelected ? clearProviderSelection : selectAllProviders}
              className="text-xs text-violet-300 hover:text-white transition"
            >
              {allProvidersSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {providerOptions.map((provider) => {
              const active = selectedProviders.includes(provider.id);
              return (
                <button
                  key={provider.id}
                  onClick={() => toggleProvider(provider.id)}
                  className={`px-3 py-2 rounded-full text-xs font-semibold transition border ${
                    active
                      ? 'bg-violet-600 text-white border-violet-500'
                      : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700'
                  }`}
                >
                  {provider.label}
                </button>
              );
            })}
          </div>
        </div>

      {isLoading || goalsLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error ? (
        <p className="text-red-400 text-center py-10">Failed to load feed.</p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {!hasGoals && (
              <Link href="/goals" className="text-sm text-violet-300 hover:text-violet-100 transition">
                Add a goal to personalize your feed →
              </Link>
            )}
          </div>

          {displayItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-700 bg-gray-900/40 p-10 text-center">
              <p className="text-gray-400 text-sm max-w-xl mx-auto">
                {hasGoals
                  ? 'We could not find enough personalized content yet. Try refining your goals or waiting while we collect more relevant resources.'
                  : 'No goals defined yet. Create a goal in the Goals page and come back for a personalized feed.'}
              </p>
            </div>
          ) : (
            <>
              <ContentGrid items={displayItems} />
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => loadMore()}
                    disabled={isFetchingNextPage}
                    className="px-5 py-3 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFetchingNextPage ? 'Loading more…' : 'Load more'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
