// frontend/src/app/profile/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { UserCircleIcon, LinkIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import auth from '@/lib/firebase';
import { sendEmailVerification, reload } from 'firebase/auth';

export default function ProfilePage() {
  const { user, token, fetchCurrentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) return;
      setLoading(true);
      try {
        await fetchCurrentUser();
        // get firebase client's verification status if available
        try {
          const current = auth.currentUser;
          if (current) {
            await current.reload();
            if (mounted) setEmailVerified(!!current.emailVerified);
          } else {
            if (mounted) setEmailVerified(null);
          }
        } catch {
          if (mounted) setEmailVerified(null);
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [token, fetchCurrentUser]);

  const handleResend = async () => {
    if (!auth.currentUser) {
      alert('No user signed in (client)');
      return;
    }
    setSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      alert('Verification email sent — check your inbox');
    } catch (err) {
      console.error('Failed to send verification email', err);
      alert('Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  const handleRefreshVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await reload(auth.currentUser);
      setEmailVerified(!!auth.currentUser?.emailVerified);
      alert('Verification status refreshed');
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  if (!token) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <div className="text-center text-gray-400">You are not signed in. Please sign in to view your profile.</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <div className="text-center text-gray-400">Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 space-y-8 max-w-3xl mx-auto">
      {/* Profile card */}
      <div className="glow-card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          {user?.photoUrl || user?.photo_url || user?.photoURL || user?.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photoUrl || user.photo_url || user.photoURL || user.picture} alt={user?.displayName || user?.display_name || user?.name || user?.email || 'User'} className="w-20 h-20 object-cover rounded-full" />
          ) : (
            <UserCircleIcon className="w-12 h-12 text-white" />
          )}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-bold text-white">{user?.displayName || user?.display_name || user?.name || user?.email || 'Your Name'}</h1>
          <p className="text-gray-400 text-sm">{user?.createdAt || user?.created_at ? `Joined ${new Date(user?.createdAt || user?.created_at || '').toLocaleDateString()}` : 'Member'}</p>
          <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start">
            {(user?.profile?.location || user?.location) && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPinIcon className="w-3.5 h-3.5" /> {user?.profile?.location || user?.location}
              </span>
            )}
            {(user?.profile?.website || user?.website) && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <LinkIcon className="w-3.5 h-3.5" /> {user?.profile?.website || user?.website}
              </span>
            )}
          </div>
        </div>
          <div className="ml-auto flex items-center gap-3">
            <button id="edit-profile-btn" className="btn-neon px-4 py-2 text-sm">Edit Profile</button>
            <div className="text-sm text-gray-300">
              {emailVerified === null ? (
                <span className="text-gray-400">Verification: unknown</span>
              ) : emailVerified ? (
                <span className="text-emerald-400">Email verified</span>
              ) : (
                <span className="text-yellow-400">Email not verified</span>
              )}
            </div>
            {!emailVerified && (
              <div className="flex flex-col">
                <button onClick={handleResend} disabled={sending} className="btn-secondary px-3 py-1 text-sm mt-1">Resend verification</button>
                <button onClick={handleRefreshVerification} className="btn-tertiary px-3 py-1 text-xs mt-1">Refresh status</button>
              </div>
            )}
          </div>
      </div>

      {/* Bio */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-2">Bio</h2>
        <div className="glow-card p-4 text-gray-400 text-sm">
          {user?.profile?.bio || 'No bio yet. Tell the community about your learning journey.'}
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
