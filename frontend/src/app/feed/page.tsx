'use client';
// frontend/src/app/feed/page.tsx
import React, { useState } from 'react';
import ContentGrid from '../../components/content/ContentGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFeed } from '../../hooks/useFeed';

export default function FeedPage() {
  const [recommended, setRecommended] = useState(false);
  const { items, isLoading, error } = useFeed(recommended);

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Feed</h1>
          <p className="text-gray-400 mt-1">Content curated just for you.</p>
        </div>
        <div className="flex gap-2">
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

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error ? (
        <p className="text-red-400 text-center py-10">Failed to load feed.</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No content yet. Start searching to populate your feed!</p>
      ) : (
        <ContentGrid items={items} />
      )}
    </main>
  );
}
