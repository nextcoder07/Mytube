'use client';
// frontend/src/components/search/SearchResults.tsx
import React from 'react';
import ContentGrid from '../content/ContentGrid';
import type { Content } from '../../types/content';
import LoadingSpinner from '../common/LoadingSpinner';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  results: Content[];
  isLoading: boolean;
  isFetching?: boolean;
  query?: string;
  onLoadMore?: () => void;
  onLoadPrevious?: () => void;
  hasMore?: boolean;
  limit?: number;
}

export default function SearchResults({ results, isLoading, isFetching, query, onLoadMore, onLoadPrevious, hasMore, limit }: Props) {
  if (isLoading && results.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">Search for anything to learn</p>
        <p className="text-sm mt-2">YouTube · GitHub · Reddit · Medium</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg">No results found for &quot;{query}&quot;</p>
        <p className="text-sm mt-2">Try different keywords or enable more providers</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          {results.length} results for <span className="text-violet-400 font-medium">&quot;{query}&quot;</span>
        </p>
        {isFetching && (
          <div className="flex items-center gap-2 text-xs text-violet-400">
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            <span>Loading more…</span>
          </div>
        )}
      </div>

      <ContentGrid items={results} />

      {/* Pagination Buttons */}
      <div className="flex justify-center gap-4 mt-8 mb-4">
        {onLoadPrevious && limit && limit > 100 && (
          <button
            onClick={onLoadPrevious}
            disabled={isFetching}
            className="group flex items-center gap-2.5 px-8 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowPathIcon className="w-4 h-4 rotate-180 group-hover:-rotate-90 transition-transform duration-500" />
            )}
            Show Less Results
          </button>
        )}

        {hasMore && onLoadMore && (
          <button
            onClick={onLoadMore}
            disabled={isFetching}
            className="group flex items-center gap-2.5 px-8 py-3 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 hover:from-violet-600/30 hover:to-fuchsia-600/30 border border-violet-500/30 hover:border-violet-500/50 text-violet-300 hover:text-white rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFetching ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Load More Results
              </>
            )}
          </button>
        )}
      </div>

      {!hasMore && results.length > 0 && (
        <p className="text-center text-xs text-gray-600 mt-8 mb-4">
          — End of results —
        </p>
      )}
    </div>
  );
}

