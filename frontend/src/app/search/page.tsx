'use client';
// frontend/src/app/search/page.tsx
import React, { useState } from 'react';
import SearchBar from '../../components/search/SearchBar';
import SearchFilters from '../../components/search/SearchFilters';
import SearchResults from '../../components/search/SearchResults';
import { useSearch } from '../../hooks/useSearch';

const ALL_PROVIDERS = ['youtube', 'github', 'reddit', 'medium'];

export default function SearchPage() {
  const { results, isLoading, search } = useSearch();
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(ALL_PROVIDERS);

  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    search({
      q: trimmed,
      providers: selectedProviders.join(','),
    });
  };

  const handleToggle = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  return (
    <main className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-gray-400 mt-1">Search across YouTube, GitHub, Reddit &amp; Medium.</p>
      </div>

      <SearchBar
        value={inputValue}
        onChange={setInputValue}
        onSearch={() => handleSearch(inputValue)}
        aiMode={aiMode}
        toggleAiMode={() => setAiMode(!aiMode)}
        loading={isLoading}
      />
      <SearchFilters selected={selectedProviders} onToggle={handleToggle} />
      <SearchResults results={results} isLoading={isLoading} query={query} />
    </main>
  );
}
