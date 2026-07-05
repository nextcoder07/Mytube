'use client';
// frontend/src/app/settings/page.tsx
import React, { useState } from 'react';
import { BellIcon, PaintBrushIcon, ShieldCheckIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);

  const Toggle = ({ id, checked, onChange }: { id: string; checked: boolean; onChange: () => void }) => (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-violet-600' : 'bg-gray-700'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );

  return (
    <main className="flex-1 p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Notifications */}
      <section className="glow-card p-5 space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-violet-400" /> Notifications
        </h2>
        {[
          { id: 'toggle-email', label: 'Email notifications', checked: emailNotifs, fn: () => setEmailNotifs((v) => !v) },
          { id: 'toggle-streak', label: 'Streak reminders', checked: streakReminders, fn: () => setStreakReminders((v) => !v) },
        ].map(({ id, label, checked, fn }) => (
          <div key={id} className="flex items-center justify-between">
            <span className="text-sm text-gray-300">{label}</span>
            <Toggle id={id} checked={checked} onChange={fn} />
          </div>
        ))}
      </section>

      {/* Appearance */}
      <section className="glow-card p-5 space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <PaintBrushIcon className="w-5 h-5 text-pink-400" /> Appearance
        </h2>
        <p className="text-sm text-gray-400">Dark mode is always on — Mytube is built for night owls. 🌙</p>
      </section>

      {/* Privacy */}
      <section className="glow-card p-5 space-y-3">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-cyan-400" /> Privacy
        </h2>
        <p className="text-sm text-gray-400">Your data is never sold. AI results are cached server-side only.</p>
      </section>

      {/* Danger zone */}
      <section className="glow-card p-5 border border-red-500/20">
        <h2 className="text-base font-semibold text-red-400 flex items-center gap-2 mb-3">
          <TrashIcon className="w-5 h-5" /> Danger Zone
        </h2>
        <button id="delete-account-btn" className="px-4 py-2 text-sm bg-red-600/20 border border-red-500/40 text-red-400 rounded-lg hover:bg-red-600/30 transition">
          Delete Account
        </button>
      </section>
    </main>
  );
}
