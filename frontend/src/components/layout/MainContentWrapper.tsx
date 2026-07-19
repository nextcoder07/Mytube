'use client';
import React from 'react';
import { usePlayerStore } from '@/store/player.store';
import GlobalPlayer from '@/components/player/GlobalPlayer';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { activeContent, isMinimized } = usePlayerStore();
  const showFullPlayer = activeContent && !isMinimized;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {"\n"}
      <div className={`flex-1 overflow-y-auto ${showFullPlayer ? 'hidden' : 'flex flex-col'}`}>
        {"\n"}
        {children}
        {"\n"}
      </div>
      {"\n"}
      <GlobalPlayer />
      {"\n"}
    </div>
  );
}

