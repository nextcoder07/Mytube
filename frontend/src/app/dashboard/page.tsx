// frontend/src/app/dashboard/page.tsx
import React from 'react';
import { ChartBarIcon, FireIcon, PlayCircleIcon, BoltIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Dashboard — Mytube',
  description: 'Your personalized learning dashboard with goals, streak, and AI suggestions.',
};

export default function DashboardPage() {
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
