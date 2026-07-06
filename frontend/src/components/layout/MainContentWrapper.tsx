'use client';
import React from 'react';
import { usePlayerStore } from '@/store/player.store';
import GlobalPlayer from '@/components/player/GlobalPlayer';

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { activeContent, isMinimized } = usePlayerStore();
  const showFullPlayer = activeContent && !isMinimized;

  return (
    <>
      <div className={`flex-1 ${showFullPlayer ? 'hidden' : 'block'}`}>
        {children}
      </div>
      <GlobalPlayer />
    </>
  );
}
