// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-firebase-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:xxx:web:xxx",
};

// Initialize Firebase client
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export default auth;

// Utility: quick sanity check to ensure developer set NEXT_PUBLIC_FIREBASE_* envs
export const isFirebaseConfigured = (): boolean => {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const domain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  // If running in browser, envs are injected at build time — check common placeholder values
  if (!key || key.includes('your-firebase') || !domain || domain.includes('firebaseapp.com') && domain.includes('your-project')) return false;
  if (!project || project.includes('your-project')) return false;
  return true;
};
