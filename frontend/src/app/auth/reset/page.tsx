'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import auth, { isFirebaseConfigured } from '@/lib/firebase';
import { confirmPasswordReset } from 'firebase/auth';

export default function ResetPage() {
  const search = useSearchParams();
  const router = useRouter();
  const oobCode = search.get('oobCode') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      // no code — redirect to forgot
      router.replace('/auth/forgot');
    }
  }, [oobCode, router]);

  const handleReset = async () => {
    if (!isFirebaseConfigured()) { alert('Firebase not configured'); return; }
    if (!password || password.length < 6) { alert('Password must be at least 6 chars'); return; }
    if (password !== confirm) { alert('Passwords do not match'); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      alert('Password reset successfully. You can now sign in.');
      router.push('/auth/login');
    } catch (err: any) {
      console.error('Confirm reset failed', err);
      alert(`Reset failed: ${err?.code || ''} ${err?.message || ''}`);
    } finally { setLoading(false); }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-white">Choose a new password</h1>
      <div className="mb-4 text-gray-400">Set a new password for your account.</div>
      <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full p-3 rounded bg-gray-800 text-white mb-3" />
      <input value={confirm} type="password" onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="w-full p-3 rounded bg-gray-800 text-white mb-4" />
      <button onClick={handleReset} disabled={loading} className="w-full btn-neon px-4 py-2">{loading ? 'Resetting...' : 'Reset password'}</button>
    </main>
  );
}
