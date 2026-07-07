// src/components/search/SearchBar.tsx
import React, { useRef, useEffect } from "react";
import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";

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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const contextPanelRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col gap-3 w-full">
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
