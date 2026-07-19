// src/components/search/SearchBar.tsx
'use client';
import React, { useRef, useEffect, useState, useCallback } from "react";
import { MagnifyingGlassIcon, SparklesIcon, XMarkIcon, ClockIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface SearchHistoryItem {
  id: string;
  query: string;
  created_at?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  aiMode,
  toggleAiMode,
  loading,
  aiContext,
  onAiContextChange,
}: {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  aiMode: boolean;
  toggleAiMode: () => void;
  loading: boolean;
  aiContext?: string;
  onAiContextChange?: (val: string) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contextPanelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Fetch search history (only for authenticated users)
  const { data: allHistory = [] } = useQuery<SearchHistoryItem[]>({
    queryKey: ["searchHistoryDropdown"],
    queryFn: async () => {
      const res = await api.get("/search/history");
      return res.data?.data || [];
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  });

  // Filter top-7 matching entries based on current input
  const filteredHistory: SearchHistoryItem[] = React.useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      // Show most recent 7 when no input
      return allHistory.slice(0, 7);
    }
    return allHistory
      .filter((item) => item.query.toLowerCase().includes(trimmed))
      .slice(0, 7);
  }, [allHistory, value]);

  const handleDeleteEntry = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await api.delete(`/search/history/${id}`);
      queryClient.setQueryData<SearchHistoryItem[]>(["searchHistoryDropdown"], (prev) =>
        (prev || []).filter((item) => item.id !== id)
      );
      // Also refetch full history page data if present
      queryClient.invalidateQueries({ queryKey: ["searchHistory"] });
    } catch (err) {
      console.error("Failed to delete search history entry:", err);
    } finally {
      setDeletingId(null);
    }
  }, [queryClient]);

  const handleClearAll = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setClearingAll(true);
    try {
      await api.delete("/search/history");
      queryClient.setQueryData(["searchHistoryDropdown"], []);
      queryClient.invalidateQueries({ queryKey: ["searchHistory"] });
      setShowHistory(false);
    } catch (err) {
      console.error("Failed to clear search history:", err);
    } finally {
      setClearingAll(false);
    }
  }, [queryClient]);

  const handleSelectHistory = useCallback((query: string) => {
    onChange(query);
    setShowHistory(false);
    // Trigger search after a tick so onChange applies
    setTimeout(onSearch, 0);
  }, [onChange, onSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setShowHistory(false);
      onSearch();
    }
    if (e.key === "Escape") {
      setShowHistory(false);
    }
  };

  // Smooth auto-resize for context textarea
  useEffect(() => {
    if (contextPanelRef.current) {
      if (aiMode) {
        contextPanelRef.current.style.maxHeight = contextPanelRef.current.scrollHeight + "px";
        contextPanelRef.current.style.opacity = "1";
      } else {
        contextPanelRef.current.style.maxHeight = "0px";
        contextPanelRef.current.style.opacity = "0";
      }
    }
  }, [aiMode]);

  const shouldShowDropdown = showHistory && isAuthenticated && filteredHistory.length > 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => { onChange(e.target.value); setShowHistory(true); }}
            onFocus={() => setShowHistory(true)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to learn today? E.g., 'Docker containers' or 'Machine learning'"
            className="w-full pl-11 pr-4 py-3 bg-gray-950/80 border border-gray-800 focus:border-violet-500 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none transition-colors shadow-inner"
          />

          {/* History dropdown */}
          {shouldShowDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectHistory(item.query)}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-800 cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ClockIcon className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-200 truncate">{item.query}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteEntry(e, item.id)}
                    disabled={deletingId === item.id}
                    className="ml-2 p-1 rounded-lg text-gray-600 hover:text-red-400 hover:bg-gray-700 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    title="Remove from history"
                    aria-label={`Remove "${item.query}" from history`}
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Clear All footer */}
              <div className="border-t border-gray-800 px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">Recent searches</span>
                <button
                  onClick={handleClearAll}
                  disabled={clearingAll}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="h-3 w-3" />
                  {clearingAll ? "Clearing…" : "Clear all"}
                </button>
              </div>
            </div>
          )}
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
            onClick={() => { setShowHistory(false); onSearch(); }}
            disabled={loading || !value.trim()}
            className="btn-neon px-6 py-3 text-sm font-semibold rounded-2xl disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* AI Context Panel — slides open when AI mode is toggled */}
      <div
        ref={contextPanelRef}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: 0, opacity: 0 }}
      >
        <div className="relative p-4 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/30 via-gray-950/60 to-fuchsia-950/20 backdrop-blur-xl shadow-lg shadow-violet-500/5">
          {/* Glow decoration */}
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
          
          <div className="flex items-center gap-2 mb-2.5">
            <SparklesIcon className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
              AI Personalization Context
            </span>
          </div>

          <textarea
            value={aiContext || ""}
            onChange={(e) => onAiContextChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSearch();
              }
            }}
            placeholder="Tell AI how to personalize your results, e.g. 'I'm a beginner in Python, show me long-form tutorials with practical projects and avoid theoretical lectures'..."
            rows={3}
            className="w-full bg-gray-950/50 border border-gray-800/80 focus:border-violet-500/60 rounded-xl text-sm text-gray-200 placeholder-gray-600 p-3 focus:outline-none resize-none transition-colors leading-relaxed"
          />

          <div className="flex items-center gap-4 mt-2.5">
            <p className="text-[11px] text-gray-500 flex-1">
              <span className="text-violet-400/70">Tip:</span> Describe your skill level, preferred content style, or specific topics to filter. Press <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400 text-[10px]">Enter</kbd> to search.
            </p>
            {aiContext && aiContext.trim().length > 0 && (
              <button
                onClick={() => onAiContextChange?.("")}
                className="text-[11px] text-gray-500 hover:text-violet-400 transition-colors font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
