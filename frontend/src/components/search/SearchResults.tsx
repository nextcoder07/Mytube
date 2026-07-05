'use client';
// frontend/src/components/search/SearchResults.tsx
import React from 'react';
import ContentGrid from '../content/ContentGrid';
import type { Content } from '../../types/content';
import LoadingSpinner from '../common/LoadingSpinner';

interface Props {
  results: Content[];
  isLoading: boolean;
  query?: string;
}

export default function SearchResults({ results, isLoading, query }: Props) {
  if (isLoading) {
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
      <p className="text-sm text-gray-400 mb-4">
        {results.length} results for <span className="text-violet-400 font-medium">&quot;{query}&quot;</span>
      </p>
      <ContentGrid items={results} />
    </div>
  );
}
