// src/components/content/ContentGrid.tsx
import React from "react";
import { Content } from "../../types/content";
import ContentCard from "./ContentCard";

export default function ContentGrid({
  items,
  onSummary,
  onNote,
  onSave,
}: {
  items: Content[];
  onSummary?: (id: string) => void;
  onNote?: (id: string) => void;
  onSave?: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
        <p className="text-sm">No items found matching the current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <div key={item.id} className="h-full">
          <ContentCard
            content={item}
            onSummary={onSummary}
            onNote={onNote}
            onSave={onSave}
          />
        </div>
      ))}
    </div>
  );
}
