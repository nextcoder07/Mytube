'use client';
// frontend/src/components/search/SearchResults.tsx
import React, { useState, useMemo } from 'react';
import ContentGrid from '../content/ContentGrid';
import type { Content } from '../../types/content';
import LoadingSpinner from '../common/LoadingSpinner';
import { ArrowPathIcon, FunnelIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

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

type SortByOption = 'relevance' | 'date' | 'popularity';

export default function SearchResults({ results, isLoading, isFetching, query, onLoadMore, onLoadPrevious, hasMore, limit }: Props) {
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortByOption>('relevance');

  // Compute stats per source
  const sourceStats = useMemo(() => {
    const stats: Record<string, number> = { youtube: 0, github: 0, reddit: 0, medium: 0, website: 0 };
    results.forEach((item) => {
      if (stats[item.source] !== undefined) {
        stats[item.source]++;
      }
    });
    return stats;
  }, [results]);

  // Compute stats per type
  const typeStats = useMemo(() => {
    const stats: Record<string, number> = { video: 0, repo: 0, post: 0, article: 0 };
    results.forEach((item) => {
      if (stats[item.type] !== undefined) {
        stats[item.type]++;
      }
    });
    return stats;
  }, [results]);

  // Process sorting and client-side filtering
  const processedResults = useMemo(() => {
    let list = [...results];

    // Filter by source
    if (activeSourceFilter !== 'all') {
      list = list.filter((item) => item.source === activeSourceFilter);
    }

    // Filter by type
    if (activeTypeFilter !== 'all') {
      list = list.filter((item) => item.type === activeTypeFilter);
    }

    // Client-side sort
    if (sortBy === 'date') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'popularity') {
      list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } // 'relevance' retains the server's smart/AI ranked order

    return list;
  }, [results, activeSourceFilter, activeTypeFilter, sortBy]);

  // Show a loading indicator while the initial fetch is in progress (including fetching state when no results yet)
  if ((isLoading || (isFetching && results.length === 0)) && results.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!query) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg font-bold text-white">Search for anything to learn</p>
        <p className="text-sm mt-2">YouTube Video Courses · GitHub Repositories · Reddit Discussions · Medium Articles</p>
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
    <div className="space-y-6">
      {/* Smart Client Filters & Sorting Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-gray-950/40 border border-gray-900 rounded-2xl">
        {/* Left Side: Filter Buttons */}
        <div className="flex flex-col gap-3">
          {/* Source Quick Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <FunnelIcon className="w-3.5 h-3.5" />
              Source:
            </span>
            <button
              onClick={() => setActiveSourceFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSourceFilter === 'all'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-900 text-gray-400 hover:text-white'
              }`}
            >
              All ({results.length})
            </button>
            {Object.entries(sourceStats).map(([src, count]) => {
              if (count === 0) return null;
              return (
                <button
                  key={src}
                  onClick={() => setActiveSourceFilter(src)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    activeSourceFilter === src
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-900 text-gray-400 hover:text-white'
                  }`}
                >
                  {src === 'website' ? 'Docs' : src} ({count})
                </button>
              );
            })}
          </div>

          {/* Type Quick Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <FunnelIcon className="w-3.5 h-3.5" />
              Type:
            </span>
            <button
              onClick={() => setActiveTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTypeFilter === 'all'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-900 text-gray-400 hover:text-white'
              }`}
            >
              All ({results.length})
            </button>
            {Object.entries(typeStats).map(([type, count]) => {
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setActiveTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    activeTypeFilter === type
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-900 text-gray-400 hover:text-white'
                  }`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Sorting Options */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <ArrowsUpDownIcon className="w-3.5 h-3.5" />
            Sort client:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortByOption)}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="relevance">Smart Rank</option>
            <option value="date">Date Published</option>
            <option value="popularity">Popularity / Views</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing {processedResults.length} of {results.length} results for{' '}
          <span className="text-violet-400 font-semibold">&quot;{query}&quot;</span>
        </p>
        {isFetching && (
          <div className="flex items-center gap-2 text-xs text-violet-400">
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            <span>Loading more…</span>
          </div>
        )}
      </div>

      <ContentGrid items={processedResults} />

      {/* Pagination Buttons */}
      <div className="flex justify-center gap-4 mt-8 mb-4">
        {onLoadPrevious && limit && limit > 100 && (
          <button
            onClick={onLoadPrevious}
            disabled={isFetching}
            className="group flex items-center gap-2.5 px-8 py-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
            className="group flex items-center gap-2.5 px-8 py-3 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 hover:from-violet-600/30 hover:to-fuchsia-600/30 border border-violet-500/30 hover:border-violet-500/50 text-violet-300 hover:text-white rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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


