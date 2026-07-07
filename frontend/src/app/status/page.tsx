import React from 'react';
import StatusPanel from '@/components/StatusPanel';

export const metadata = {
  title: 'Status — Mytube',
  description: 'Backend status checks',
};

export default function StatusPage() {
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-4">Service Status</h1>
      <StatusPanel />
    </main>
  );
}
