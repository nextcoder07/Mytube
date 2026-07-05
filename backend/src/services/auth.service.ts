// src/services/auth.service.ts
import { supabase } from "../utils/supabase";
import { User } from "../models/user.model";

export class AuthService {
  /**
   * Register or log in a user verified by Firebase Admin.
   * Creates Supabase user and default profile if not existing.
   */
  static async resolveUser(decodedToken: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
  }): Promise<User> {
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      throw new Error("Email is required for authentication");
    }

    // 1. Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", uid)
      .single();

    if (existingUser) {
      // Update display name or avatar if changed
      if (existingUser.display_name !== name || existingUser.photo_url !== picture) {
        const { data: updated } = await supabase
          .from("users")
          .update({
            display_name: name || existingUser.display_name,
            photo_url: picture || existingUser.photo_url,
            updated_at: new Date(),
          })
          .eq("id", uid)
          .select()
          .single();
        if (updated) return updated as any;
      }
      return existingUser as any;
    }

    // 2. User does not exist, create user in DB
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: uid,
        email,
        display_name: name || email.split("@")[0],
        photo_url: picture || "",
        role: "user",
        subscription: "free",
      })
      .select()
      .single();

    if (insertError || !newUser) {
      throw new Error(`Failed to create user record: ${insertError?.message}`);
    }

    // 3. Create default profile for the user
    const { error: profileError } = await supabase.from("profiles").insert({
      id: uid,
      bio: "Learning on MyTube!",
      learning_style: "mixed",
      daily_goal_minutes: 30,
      streak: 0,
      total_xp: 0,
    });

    if (profileError) {
      console.error("Failed to create default user profile:", profileError.message);
    }

    return newUser as any;
  }
}

export default AuthService;
