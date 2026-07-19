// src/components/content/ContentGrid.tsx
import React from "react";
import { Content } from "../../types/content";
import ContentCard from "./ContentCard";
import { usePlayerStore } from "../../store/player.store";

export default function ContentGrid({
  items,
  onClick,
  goalBadgeIds,
}: {
  items: Content[];
  onClick?: (content: Content) => void;
  goalBadgeIds?: Set<string>;
}) {
  const { play } = usePlayerStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
        <p className="text-sm">No items found matching the current filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <div key={item.id} className="h-full content-visibility-auto">
          <ContentCard
            content={item}
            onClick={(c) => onClick ? onClick(c) : play(c, items)}
            priority={index < 4}
            goalBadge={goalBadgeIds?.has(item.id)}
          />
        </div>
      ))}
    </div>
  );
}
