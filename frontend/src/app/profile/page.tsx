// frontend/src/app/profile/page.tsx
import React from 'react';
import { UserCircleIcon, LinkIcon, MapPinIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Profile — Mytube',
  description: 'Your public learning profile.',
};

export default function ProfilePage() {
  return (
    <main className="flex-1 p-6 space-y-8 max-w-3xl mx-auto">
      {/* Profile card */}
      <div className="glow-card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <UserCircleIcon className="w-12 h-12 text-white" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold text-white">Your Name</h1>
          <p className="text-gray-400 text-sm">Joined July 2026</p>
          <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPinIcon className="w-3.5 h-3.5" /> Location
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <LinkIcon className="w-3.5 h-3.5" /> website.com
            </span>
          </div>
        </div>
        <button id="edit-profile-btn" className="ml-auto btn-neon px-4 py-2 text-sm">Edit Profile</button>
      </div>

      {/* Bio */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Bio</h2>
        <div className="glow-card p-4 text-gray-400 text-sm">
          No bio yet. Tell the community about your learning journey.
        </div>
      </section>

      {/* Public playlists */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">Public Playlists</h2>
        <div className="glow-card p-4 text-gray-400 text-sm">
          No public playlists. Make a playlist public to share it here.
        </div>
      </section>
    </main>
  );
}
