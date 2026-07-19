'use client';

import React, { useEffect, useState } from 'react';

export default function BackendStatus() {
  const [backendStatus, setBackendStatus] = useState<string>('Checking backend connection...');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setBackendStatus('✅ Backend is connected successfully!');
          setIsSuccess(true);
        } else {
          setBackendStatus('⚠️ Backend connected, but returned unexpected status.');
          setIsSuccess(false);
        }
      })
      .catch(() => {
        setBackendStatus('❌ Failed to connect to the backend.');
        setIsSuccess(false);
      });
  }, []);

  return (
    <div className={`mt-6 w-full max-w-md p-4 rounded-xl border text-center transition-all ${
      isSuccess === true
        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
        : isSuccess === false
        ? 'bg-rose-950/20 border-rose-500/30 text-rose-400'
        : 'bg-zinc-900/50 border-zinc-850 text-zinc-400 animate-pulse'
    }`}>
      <p className="text-sm font-medium">{backendStatus}</p>
    </div>
  );
}
