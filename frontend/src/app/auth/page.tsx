'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthRoot() {
  const router = useRouter();
  useEffect(() => { router.push('/auth/login'); }, [router]);
  return null;
}
