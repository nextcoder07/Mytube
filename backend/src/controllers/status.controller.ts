import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import config from '../config';
import { firebaseAuth } from '../config/firebase';

export const getStatus = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Check Supabase by attempting a lightweight head select on users
    let dbStatus = { ok: false, details: '' };
    try {
      const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' });
      if (error) {
        dbStatus = { ok: false, details: error.message };
      } else {
        dbStatus = { ok: true, details: 'Connected' };
      }
    } catch (err: any) {
      dbStatus = { ok: false, details: err.message || String(err) };
    }

    // Check Firebase Admin readiness
    const isPlaceholderKey =
      !config.firebasePrivateKey ||
      config.firebasePrivateKey.includes('YOUR_PRIVATE_KEY') ||
      config.firebaseProjectId.includes('your-firebase-project-id');

    const firebaseStatus = isPlaceholderKey ? { ok: false, details: 'Using MOCK Firebase (placeholder credentials)' } : { ok: true, details: 'Firebase Admin initialized' };

    // Attempt a lightweight verifyIdToken with a dummy token only if not placeholder
    if (firebaseStatus.ok) {
      try {
        // do not pass a real token; just check that method exists
        if (typeof firebaseAuth.verifyIdToken !== 'function') {
          firebaseStatus.ok = false;
          firebaseStatus.details = 'Firebase Admin not functional';
        }
      } catch (err: any) {
        firebaseStatus.ok = false;
        firebaseStatus.details = err.message || String(err);
      }
    }

    res.status(200).json({ ok: true, env: { nodeEnv: config.nodeEnv }, services: { database: dbStatus, firebase: firebaseStatus } });
  } catch (err) {
    next(err);
  }
};

export default { getStatus };
