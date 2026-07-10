import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";
import { userKeyRotationManager } from "../utils/userKeyManager";
import { success } from "../utils/response";

export const providerKeyStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?.uid;

    // Fetch profile keys if user available
    let profile: any = null;
    if (userId) {
      try {
        const { data } = await supabase.from("profiles").select("user_youtube_api_keys, user_github_api_keys").eq("id", userId).single();
        profile = data || null;
      } catch (err: any) {
        // swallow DB errors but report
        profile = { error: err.message };
      }
    }

    // Env keys (MYTUBE_* preferred)
    const env = {
      youtube_keys: (process.env.MYTUBE_YOUTUBE_API_KEYS || process.env.YOUTUBE_API_KEYS) || null,
      youtube_key_single: (process.env.MYTUBE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY) || null,
      github_tokens: (process.env.MYTUBE_GITHUB_TOKENS || process.env.GITHUB_TOKENS) || null,
      github_token_single: (process.env.MYTUBE_GITHUB_TOKEN || process.env.GITHUB_TOKEN) || null,
    };

    // Rotation manager state for the user
    const rotationState: any = {};
    try {
      const ytState = (userKeyRotationManager as any).serviceStates?.get("youtube")?.get(userId || "anonymous");
      const ghState = (userKeyRotationManager as any).serviceStates?.get("github")?.get(userId || "anonymous");
      rotationState.youtube = ytState ? { keys: ytState.keys, currentIndex: ytState.currentIndex } : null;
      rotationState.github = ghState ? { keys: ghState.keys, currentIndex: ghState.currentIndex } : null;
    } catch (e) {
      rotationState.error = (e as Error).message;
    }

    res.status(200).json(success({ profile, env, rotationState }, "Provider key status"));
  } catch (err: any) {
    next(err);
  }
};

export const debugStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user || null;

    // quick DB smoke-test
    const { data, error } = await supabase.from("users").select("id").limit(1);
    if (error) {
      return next(error);
    }

    res.status(200).json(success({ user, db: { ok: true, sample: data } }, "Debug ok"));
  } catch (err: any) {
    next(err);
  }
};

export default { providerKeyStatus, debugStatus };
