import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Search Curation',
  description: 'Search and curate high quality educational assets across YouTube, GitHub, Reddit, and web articles.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
