// frontend/src/app/progress/page.tsx
import React from 'react';
import { FireIcon, BoltIcon, TrophyIcon, ClockIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Progress — Mytube',
  description: 'Track your learning progress, streaks, XP, and goal completions.',
};

const stats = [
  { label: 'Current Streak',   value: '7 days',  icon: FireIcon,    color: 'text-orange-400' },
  { label: 'Total XP',         value: '2,340',   icon: BoltIcon,    color: 'text-violet-400' },
  { label: 'Goals Completed',  value: '2',       icon: TrophyIcon,  color: 'text-yellow-400' },
  { label: 'Hours Learned',    value: '34h',     icon: ClockIcon,   color: 'text-cyan-400'   },
];

export default function ProgressPage() {
  return (
    <main className="flex-1 p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <p className="text-gray-400 mt-1">Your learning journey, visualized.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glow-card p-5 text-center">
            <Icon className={`w-7 h-7 mx-auto mb-2 ${color}`} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Chart placeholder */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Weekly Activity</h2>
        <div className="glow-card p-6">
          <div className="flex items-end justify-around gap-2 h-32">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
              const heights = [40, 65, 50, 80, 70, 30, 55];
              return (
                <div key={day} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-violet-600 to-pink-500 opacity-80 transition-all duration-500"
                    style={{ height: `${heights[i]}%` }}
                  />
                  <span className="text-xs text-gray-500">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Goal progress */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Goal Completion</h2>
        <div className="glow-card p-5 text-gray-400 text-sm">
          No goals created yet. Head to Dashboard to create your first goal.
        </div>
      </section>
    </main>
  );
}
