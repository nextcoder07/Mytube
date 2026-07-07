'use client';
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/config';

export default function StatusPanel() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/status`);
        const body = await res.json();
        if (mounted) setStatus(body);
      } catch (err) {
        if (mounted) setStatus({ error: (err as any).message || String(err) });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-4 text-sm text-gray-400">Checking backend status...</div>;
  if (!status) return <div className="p-4 text-sm text-red-400">No status returned</div>;

  return (
    <div className="p-4 bg-gray-800 rounded-md text-sm text-gray-200">
      <div className="mb-2 font-semibold">Backend Status</div>
      <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
