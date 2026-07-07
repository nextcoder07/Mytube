// src/components/search/SearchFilters.tsx
'use client';
import React, { useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import type { SearchFiltersState } from "../../types/content";
import { VIDEO_CATEGORIES, LANGUAGES } from "../../types/content";

const providersList = [
  { id: "youtube", label: "YouTube" },
  { id: "github", label: "GitHub" },
  { id: "reddit", label: "Reddit" },
  { id: "medium", label: "Medium" },
  { id: "website", label: "Official Docs" },
];

const ORDER_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "date", label: "Newest" },
  { value: "viewCount", label: "Most Viewed" },
  { value: "rating", label: "Top Rated" },
] as const;

const DURATION_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "short", label: "Short (<4m)" },
  { value: "medium", label: "Medium (4–20m)" },
  { value: "long", label: "Long (>20m)" },
] as const;

export default function SearchFilters({
  selected,
  onToggle,
  filters,
  onFilterChange,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  filters: SearchFiltersState;
  onFilterChange: (key: keyof SearchFiltersState, value: string) => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Provider sources row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Search content sources
          </span>
          <div className="flex flex-wrap gap-2">
            {providersList.map((p) => {
              const active = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => onToggle(p.id)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-violet-600/10 text-violet-400 border-violet-500/40"
                      : "bg-gray-950/60 text-gray-500 border-gray-900 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced filters toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${
            showAdvanced
              ? "bg-violet-600/15 text-violet-400 border-violet-500/40 shadow-sm shadow-violet-500/10"
              : "bg-gray-950/60 text-gray-500 border-gray-900 hover:text-white hover:border-gray-700"
          }`}
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          Filters
          <ChevronDownIcon
            className={`h-3 w-3 transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Advanced Filters Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          showAdvanced ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 rounded-2xl border border-gray-800/80 bg-gray-950/50 backdrop-blur-sm space-y-4">
          {/* Row 1: Sort By + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sort By */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Sort By
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ORDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onFilterChange("order", opt.value)}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                      filters.order === opt.value
                        ? "bg-violet-600/15 text-violet-400 border-violet-500/40"
                        : "bg-gray-900/50 text-gray-500 border-gray-800 hover:text-white hover:border-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Duration
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onFilterChange("videoDuration", opt.value)}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                      filters.videoDuration === opt.value
                        ? "bg-violet-600/15 text-violet-400 border-violet-500/40"
                        : "bg-gray-900/50 text-gray-500 border-gray-800 hover:text-white hover:border-gray-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Category + Language (dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Category
              </label>
              <div className="relative">
                <select
                  value={filters.videoCategoryId}
                  onChange={(e) => onFilterChange("videoCategoryId", e.target.value)}
                  className="w-full appearance-none bg-gray-900/50 border border-gray-800 text-sm text-gray-300 rounded-lg px-3 py-2 pr-8 focus:border-violet-500/50 focus:outline-none transition-colors cursor-pointer"
                >
                  {VIDEO_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Language
              </label>
              <div className="relative">
                <select
                  value={filters.relevanceLanguage}
                  onChange={(e) => onFilterChange("relevanceLanguage", e.target.value)}
                  className="w-full appearance-none bg-gray-900/50 border border-gray-800 text-sm text-gray-300 rounded-lg px-3 py-2 pr-8 focus:border-violet-500/50 focus:outline-none transition-colors cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active filters summary */}
          {(filters.order !== "relevance" ||
            filters.videoDuration !== "any" ||
            filters.videoCategoryId !== "" ||
            filters.relevanceLanguage !== "en") && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
              <div className="flex flex-wrap gap-1.5">
                {filters.order !== "relevance" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-950/30 border border-violet-500/20 text-[10px] text-violet-400 font-medium">
                    Sort: {ORDER_OPTIONS.find((o) => o.value === filters.order)?.label}
                    <button
                      onClick={() => onFilterChange("order", "relevance")}
                      className="hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.videoDuration !== "any" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-950/30 border border-violet-500/20 text-[10px] text-violet-400 font-medium">
                    Duration: {DURATION_OPTIONS.find((d) => d.value === filters.videoDuration)?.label}
                    <button
                      onClick={() => onFilterChange("videoDuration", "any")}
                      className="hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.videoCategoryId !== "" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-950/30 border border-violet-500/20 text-[10px] text-violet-400 font-medium">
                    {VIDEO_CATEGORIES.find((c) => c.id === filters.videoCategoryId)?.label}
                    <button
                      onClick={() => onFilterChange("videoCategoryId", "")}
                      className="hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.relevanceLanguage !== "en" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-950/30 border border-violet-500/20 text-[10px] text-violet-400 font-medium">
                    Lang: {LANGUAGES.find((l) => l.code === filters.relevanceLanguage)?.label}
                    <button
                      onClick={() => onFilterChange("relevanceLanguage", "en")}
                      className="hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  onFilterChange("order", "relevance");
                  onFilterChange("videoDuration", "any");
                  onFilterChange("videoCategoryId", "");
                  onFilterChange("relevanceLanguage", "en");
                }}
                className="text-[11px] text-gray-500 hover:text-violet-400 transition-colors font-semibold"
              >
                Reset All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
