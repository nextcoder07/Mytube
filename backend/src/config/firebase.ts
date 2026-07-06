// src/config/firebase.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import config from "./index";

// Initialize Firebase Admin SDK using modular subpaths or mock if key is placeholder

let firebaseAuth: any;

const isPlaceholderKey =
  !config.firebasePrivateKey ||
  config.firebasePrivateKey.includes("YOUR_PRIVATE_KEY") ||
  config.firebaseProjectId.includes("your-firebase-project-id");

if (isPlaceholderKey) {
  console.warn("⚠️ Firebase configuration is not set or using placeholders. Using MOCK Firebase Admin SDK.");
  firebaseAuth = {
    verifyIdToken: async (idToken: string) => {
      console.log(`[Mock Firebase Admin] Verifying token: ${idToken}`);
      return {
        uid: "mock-user-123",
        email: "mock@example.com",
        name: "Mock User",
        picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      };
    },
  };
} else {
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: config.firebaseProjectId,
          clientEmail: config.firebaseClientEmail,
          privateKey: config.firebasePrivateKey.replace(/\\n/g, "\n"),
        }),
      });
    }
    firebaseAuth = getAuth();
  } catch (err: any) {
    console.error("⚠️ Failed to initialize Firebase Admin SDK. Falling back to MOCK Firebase Admin.", err.message);
    firebaseAuth = {
      verifyIdToken: async (idToken: string) => {
        return {
          uid: "mock-user-123",
          email: "mock@example.com",
          name: "Mock User",
          picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        };
      },
    };
  }
}

export { firebaseAuth };
export default firebaseAuth;
