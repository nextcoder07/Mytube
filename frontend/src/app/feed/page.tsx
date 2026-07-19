'use client';
// frontend/src/app/feed/page.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFeed } from '../../hooks/useFeed';
import { useGoals } from '../../hooks/useGoals';
import { usePlayerStore } from '../../store/player.store';
import { api } from '../../lib/api';


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
  const [refreshExcludedIds, setRefreshExcludedIds] = useState<string[]>([]);

  const excludedIds = refreshExcludedIds;


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
  const { play } = usePlayerStore();

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
              onClick={() => {
                setRefreshExcludedIds(items.map((item) => item.id));
                setRefreshKey((prev) => prev + 1);
              }}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      play(item, displayItems);
                      api.post('/history/feed', { content: item, goalId: selectedGoalId ?? undefined }).catch((err) => {
                        console.warn('Failed to sync feed history to DB:', err.message || err);
                      });
                    }}
                    className="glow-card group flex flex-col h-full overflow-hidden cursor-pointer hover:border-violet-500/50 transition-colors border border-gray-800 bg-gray-950/80"
                  >
                    <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="h-full w-full bg-gray-700" />
                      )}
                      {item.type === 'video' && item.duration ? (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-xs font-semibold text-white rounded">
                          {Math.floor(item.duration / 60)}:{item.duration % 60 < 10 ? '0' : ''}{item.duration % 60}
                        </span>
                      ) : null}
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {item.source}
                      </span>
                    </div>
                    <div className="flex-1 p-4 flex flex-col">
                      <h3 className="text-base font-bold line-clamp-2 text-white mb-2">{item.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-3 mb-4 flex-1">{item.description || 'No description available.'}</p>
                      <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                        <span>{item.author || 'Unknown author'}</span>
                        {item.viewCount !== undefined && (
                          <span>👁️ {item.viewCount.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
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
