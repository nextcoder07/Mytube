// src/auth/firebase.auth.ts — Firebase Admin token verification
import { adminAuth } from '../config/firebase';

export interface DecodedUser {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}

export async function verifyIdToken(idToken: string): Promise<DecodedUser> {
  const decoded = await adminAuth.verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: decoded.email ?? '',
    name: decoded.name,
    picture: decoded.picture,
  };
}
