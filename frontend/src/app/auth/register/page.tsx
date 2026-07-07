'use client';
import React, { useState } from 'react';
import auth from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  const handleEmailRegister = async () => {
    setLoading(true);
    try {
      if (!email || !password || !name) {
        alert('Please provide name, email and password');
        setLoading(false);
        return;
      }
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      try { await sendEmailVerification(res.user); console.log('Verification email sent'); } catch (evErr) { console.warn('Failed to send verification email', evErr); }
      const idToken = await res.user.getIdToken();
      await register(idToken);
      router.push('/profile');
    } catch (err: any) {
      console.error('Register error', err);
      alert(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Register</h1>
      <div className="mb-6 text-sm text-gray-400">Create an account using email and password.</div>
      <div className="grid grid-cols-1 gap-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full p-3 rounded bg-gray-800 text-white"
        />
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
        <button onClick={handleEmailRegister} disabled={loading} className="w-full btn-secondary px-4 py-2 text-sm">
          {loading ? 'Processing...' : 'Register with Email'}
        </button>
      </div>

      <div className="text-sm text-gray-400">Already have an account? <a href="/auth/login" className="text-indigo-400 hover:underline">Sign in</a>.</div>
    </main>
  );
}
