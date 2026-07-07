'use client';
import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/search/SearchBar';
import SearchResults from '../../components/search/SearchResults';
import SearchFilters from '../../components/search/SearchFilters';
import { useSearch } from '../../hooks/useSearch';

export default function SearchPage() {
  const { 
    results, 
    isLoading, 
    isFetching, 
    search, 
    loadMore, 
    loadPrevious, 
    goBackQuery, 
    hasMore, 
    hasHistory,
    currentQuery,
    limit 
  } = useSearch();
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [aiContext, setAiContext] = useState('');
  const ALL_PROVIDERS = ["youtube", "github", "reddit", "medium", "website"];
  const [selectedProviders, setSelectedProviders] = useState<string[]>(ALL_PROVIDERS);
  const [filters, setFilters] = useState({
    order: 'relevance',
    videoDuration: 'any',
    videoCategoryId: '',
    relevanceLanguage: 'en',
  });

  // Sync inputs with the current active query (important when traversing query history)
  useEffect(() => {
    if (currentQuery) {
      setQuery(currentQuery);
      setInputValue(currentQuery);
    } else {
      setQuery('');
      setInputValue('');
    }
  }, [currentQuery]);

  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    search({
      q: trimmed,
      aiMode,
      aiContext: aiMode ? aiContext : undefined,
      providers: selectedProviders.join(","),
      order: filters.order,
      videoDuration: filters.videoDuration,
      videoCategoryId: filters.videoCategoryId,
      relevanceLanguage: filters.relevanceLanguage,
    });
  };

  const handleToggleProvider = (id: string) => {
    setSelectedProviders((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      return [...prev, id];
    });
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Search</h1>
          <p className="text-gray-400 mt-1">Search across YouTube, GitHub, Reddit &amp; Medium.</p>
        </div>
        {hasHistory && (
          <button
            onClick={goBackQuery}
            className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 font-semibold transition-colors bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 px-4 py-2 rounded-xl shadow-sm"
          >
            ← Back to Previous Search
          </button>
        )}
      </div>

      <SearchBar
        value={inputValue}
        onChange={setInputValue}
        onSearch={() => handleSearch(inputValue)}
        aiMode={aiMode}
        toggleAiMode={() => setAiMode(!aiMode)}
        loading={isLoading}
        aiContext={aiContext}
        onAiContextChange={setAiContext}
      />
      <div className="mt-4">
        <SearchFilters
          selected={selectedProviders}
          onToggle={handleToggleProvider}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>
      <SearchResults
        results={results}
        isLoading={isLoading}
        isFetching={isFetching}
        query={query}
        onLoadMore={loadMore}
        onLoadPrevious={loadPrevious}
        hasMore={hasMore}
        limit={limit}
      />
    </main>
  );
}
