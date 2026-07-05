// src/config/firebase.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import config from "./index";

// Initialize Firebase Admin SDK using modular subpaths
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: config.firebaseProjectId,
      clientEmail: config.firebaseClientEmail,
      // Private key must have newlines restored
      privateKey: config.firebasePrivateKey.replace(/\\n/g, "\n"),
    }),
  });
}

export const firebaseAuth = getAuth();
export default firebaseAuth;
