import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Learning History',
  description: 'View your watch history, search queries, and goals-aligned historical records.',
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
