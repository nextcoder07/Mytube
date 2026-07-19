import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Learning Goals',
  description: 'Manage and update your active, completed, or upcoming educational tracks.',
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
