// frontend/src/app/dashboard/page.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ChartBarIcon, FireIcon, PlayCircleIcon, BoltIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { usePlayerStore } from '../../store/player.store';
import type { Content } from '../../types/content';

export default function DashboardPage() {
  const { play } = usePlayerStore();
  const [seenOnboarding, setSeenOnboarding] = useState(true);

  useEffect(() => {
    const value = window.localStorage.getItem('mytube-onboarding-seen');
    setSeenOnboarding(Boolean(value));
  }, []);

  const { data: watchHistory = [] } = useQuery<{ content: Content }[]>({
    queryKey: ['watchHistory'],
    queryFn: async () => {
      const res = await api.get('/history');
      return res.data?.data || [];
    },
  });

  const continueWatching = useMemo(() => watchHistory.slice(0, 4), [watchHistory]);

  return (
    <main className="flex-1 p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back — keep the momentum going.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Day Streak', value: '7', icon: FireIcon, color: 'from-orange-500 to-amber-500' },
          { label: 'XP Earned', value: '2,340', icon: BoltIcon, color: 'from-violet-500 to-purple-600' },
          { label: 'Videos Watched', value: '42', icon: PlayCircleIcon, color: 'from-pink-500 to-rose-600' },
          { label: 'Goals Active', value: '3', icon: ChartBarIcon, color: 'from-cyan-500 to-blue-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glow-card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {!seenOnboarding && (
        <section className="rounded-3xl border border-violet-500/30 bg-violet-600/10 p-5">
          <h2 className="text-lg font-semibold text-white">Welcome to Mytube</h2>
          <p className="text-sm text-gray-300 mt-2">Create a goal to unlock a more focused feed, then use Watch Later whenever you want to save something for later.</p>
          <button
            onClick={() => {
              window.localStorage.setItem('mytube-onboarding-seen', 'true');
              setSeenOnboarding(true);
            }}
            className="mt-3 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Got it
          </button>
        </section>
      )}

      {continueWatching.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Continue Watching</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continueWatching.map((entry) => (
              <button
                key={entry.content.id}
                type="button"
                onClick={() => play(entry.content, continueWatching.map((item) => item.content))}
                className="glow-card flex items-center gap-3 p-4 text-left"
              >
                <div className="rounded-2xl bg-violet-500/10 p-2 border border-violet-500/20">
                  <PlayIcon className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white line-clamp-2">{entry.content.title}</p>
                  <p className="text-xs text-gray-400 mt-1">Resume from your history</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Today's Goal */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Today&apos;s Focus</h2>
        <div className="glow-card p-5">
          <p className="text-gray-300">No active goals yet. Create a goal to get personalized learning paths.</p>
          <button className="mt-3 btn-neon px-4 py-2 text-sm">+ Create Goal</button>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Recent Activity</h2>
        <div className="glow-card p-5 text-gray-400 text-sm">
          No recent activity. Start searching or watching content to populate your history.
        </div>
      </section>
    </main>
  );
}
