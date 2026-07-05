// src/components/search/SearchFilters.tsx
import React from "react";

const providersList = [
  { id: "youtube", label: "YouTube" },
  { id: "github", label: "GitHub" },
  { id: "reddit", label: "Reddit" },
  { id: "medium", label: "Medium" },
  { id: "website", label: "Official Docs" },
];

export default function SearchFilters({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
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
  );
}
