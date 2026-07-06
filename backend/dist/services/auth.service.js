"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
// src/services/auth.service.ts
const supabase_1 = require("../utils/supabase");
class AuthService {
    /**
     * Register or log in a user verified by Firebase Admin.
     * Creates Supabase user and default profile if not existing.
     */
    static async resolveUser(decodedToken) {
        const { uid, email, name, picture } = decodedToken;
        if (!email) {
            throw new Error("Email is required for authentication");
        }
        // 1. Check if user exists in Supabase
        const { data: existingUser, error: fetchError } = await supabase_1.supabase
            .from("users")
            .select("*")
            .eq("id", uid)
            .single();
        if (existingUser) {
            // Update display name or avatar if changed
            if (existingUser.display_name !== name || existingUser.photo_url !== picture) {
                const { data: updated } = await supabase_1.supabase
                    .from("users")
                    .update({
                    display_name: name || existingUser.display_name,
                    photo_url: picture || existingUser.photo_url,
                    updated_at: new Date(),
                })
                    .eq("id", uid)
                    .select()
                    .single();
                if (updated)
                    return updated;
            }
            return existingUser;
        }
        // 2. User does not exist, create user in DB
        const { data: newUser, error: insertError } = await supabase_1.supabase
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
        const { error: profileError } = await supabase_1.supabase.from("profiles").insert({
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
        return newUser;
    }
}
exports.AuthService = AuthService;
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map