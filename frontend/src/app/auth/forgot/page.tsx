'use client';
import React, { useState } from 'react';
import auth, { isFirebaseConfigured } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!isFirebaseConfigured()) {
      alert('Firebase client config not set. Add NEXT_PUBLIC_FIREBASE_* env variables.');
      return;
    }
    if (!email) { alert('Enter your email'); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent. Check your inbox.');
    } catch (err: unknown) {
      console.error('Reset email failed', err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Failed: ${message}`);
    } finally { setLoading(false); }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Reset your password</h1>
      <div className="mb-4 text-gray-400">Enter your account email and we&apos;ll send a password reset link.</div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-3 rounded bg-gray-800 text-white mb-4" />
      <button onClick={handleSend} disabled={loading} className="w-full btn-neon px-4 py-2">{loading ? 'Sending...' : 'Send reset email'}</button>
      <div className="mt-4 text-sm text-gray-400">Remembered your password? <a href="/auth/login" className="text-indigo-400 hover:underline">Sign in</a></div>
    </main>
  );
}
