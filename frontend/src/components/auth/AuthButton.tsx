"use client";
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AuthButton() {
  const { user, token, signOut, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const router = useRouter();
  const handleOpenAuth = () => router.push('/auth/login');

  const handleLogout = () => {
    signOut();
  };

  if (isLoading) {
    return <button className="btn-neon px-3 py-1">Signing in...</button>;
  }

  // During SSR and initial hydration, keep the server-safe markup (Sign in button)
  if (!mounted) {
    return (
      <button onClick={handleOpenAuth} className="btn-neon px-3 py-1">
        Sign in
      </button>
    );
  }

  if (!token) {
    return (
      <button onClick={handleOpenAuth} className="btn-neon px-3 py-1">
        Sign in
      </button>
    );
  }

  const avatar = (user && (user.photoUrl || user.photo_url || user.photoURL || user.picture)) || null;
  const name = (user && (user.displayName || user.display_name || user.name || user.email || 'User')) || 'User';

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
        {avatar ? (
          // next/image requires allowed domains in next.config for external urls — fallback to simple img if needed
          // Use native img to avoid build-time issues with external domains
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="w-8 h-8 object-cover" />
        ) : (
          <div className="w-8 h-8 bg-gray-600" />
        )}
      </div>
      <button onClick={handleLogout} className="btn-secondary px-3 py-1 text-sm">
        Logout
      </button>
    </div>
  );
}
