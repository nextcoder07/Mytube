'use client';
import React, { useState } from 'react';
import auth from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      if (!email || !password) {
        alert('Please provide email and password');
        setLoading(false);
        return;
      }
      const res = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await res.user.getIdToken();
      await login(idToken);
      router.push('/profile');
    } catch (err: any) {
      console.error('Login error', err);
      alert(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Sign in</h1>
      <div className="mb-6 text-sm text-gray-400">Sign in with your email and password.</div>
      <div className="grid grid-cols-1 gap-3 mb-6">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 rounded bg-gray-800 text-white"
          type="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 rounded bg-gray-800 text-white"
          type="password"
        />
      </div>

      <div className="space-y-3 mb-6">
        <button onClick={handleEmailLogin} disabled={loading} className="w-full btn-neon px-4 py-2 text-sm">
          {loading ? 'Processing...' : 'Sign in with Email'}
        </button>
      </div>

      <div className="text-sm text-gray-400">Don't have an account? <a href="/auth/register" className="text-indigo-400 hover:underline">Create one</a>.</div>
    </main>
  );
}
