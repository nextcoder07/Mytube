"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthButton() {
  const { user, token, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const router = useRouter();
  const handleOpenAuth = () => router.push('/auth/login');

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
    <Link href="/profile" className="flex items-center gap-3 cursor-pointer">
      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-700 hover:ring-2 hover:ring-violet-500 transition-all">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={32}
            height={32}
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 bg-gray-600 flex items-center justify-center text-xs font-bold text-white uppercase">
            {name.charAt(0)}
          </div>
        )}
      </div>
    </Link>
  );
}

