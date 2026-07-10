'use client';
// frontend/src/app/feed/page.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import ContentGrid from '../../components/content/ContentGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFeed } from '../../hooks/useFeed';
import { useLocalGoalFeed } from '../../hooks/useLocalGoalFeed';
import { useGoals } from '../../hooks/useGoals';

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
  const [recommended, setRecommended] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(providerOptions.map((p) => p.id));

  const { items, isLoading, error, loadMore, hasMore, isFetchingNextPage } = useFeed(
    recommended,
    selectedProviders,
    12
  );
  const { items: localGoalItems } = useLocalGoalFeed();
  const { goals, isLoading: goalsLoading } = useGoals();

  const hasGoals = goals.length > 0;
  const displayItems = recommended && localGoalItems.length > 0 ? localGoalItems : items;
  const title = recommended ? 'Recommended for You' : hasGoals ? 'Goal-based Feed' : 'General Feed';

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
          <h1 className="text-2xl font-bold text-white">Feed</h1>
          <p className="text-gray-400 mt-1">Content curated from your goals and recent activity.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            id="feed-tab-all"
            onClick={() => setRecommended(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              !recommended ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            id="feed-tab-recommended"
            onClick={() => setRecommended(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              recommended ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Recommended
          </button>
        </div>
      </div>

      {!recommended && (
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
      )}

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
                  ? 'We could not find enough personalized content yet. Try generating a roadmap or exploring goals in the Goals page.'
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
