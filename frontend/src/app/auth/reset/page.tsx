'use client';
import React, { Suspense } from 'react';
import ResetForm from './ResetForm';

export default function ResetPage() {
  return (
    <main className="p-6 max-w-xl mx-auto">
      <Suspense fallback={<div className="text-gray-400">Loading reset form...</div>}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
