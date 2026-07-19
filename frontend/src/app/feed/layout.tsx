import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Learning Feed',
  description: 'Your personalized educational content feed. Discover matching videos, articles, and repos based on your learning goals.',
};

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
