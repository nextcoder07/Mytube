// src/components/search/SearchBar.tsx
import React from "react";
import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function SearchBar({
  value,
  onChange,
  onSearch,
  aiMode,
  toggleAiMode,
  loading,
}: {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  aiMode: boolean;
  toggleAiMode: () => void;
  loading: boolean;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full">
      {/* Search Input Box */}
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to learn today? E.g., 'Docker containers' or 'Machine learning'"
          className="w-full pl-11 pr-4 py-3 bg-gray-950/80 border border-gray-800 focus:border-violet-500 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors shadow-inner"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {/* Toggle AI mode */}
        <button
          onClick={toggleAiMode}
          className={`flex items-center gap-1.5 px-4 py-3 border rounded-2xl text-xs font-bold transition-all duration-200 ${
            aiMode
              ? "bg-violet-600/20 text-violet-400 border-violet-500 shadow-md shadow-violet-500/10"
              : "bg-gray-950/80 text-gray-400 border-gray-800 hover:text-white"
          }`}
          title="Enable AI Re-ranking and explanations"
        >
          <SparklesIcon className="h-4.5 w-4.5 animate-pulse" />
          <span>AI Search</span>
        </button>

        {/* Search button */}
        <button
          onClick={onSearch}
          disabled={loading || !value.trim()}
          className="btn-neon px-6 py-3 text-sm font-semibold rounded-2xl disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </div>
  );
}
