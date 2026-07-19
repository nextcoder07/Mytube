import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your profile preference, dark mode, API keys, and connection credentials.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
