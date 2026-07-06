"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePremium = void 0;
const errors_1 = require("../utils/errors");
const supabase_1 = require("../utils/supabase");
/** Require the authenticated user to have subscription = 'premium' */
const requirePremium = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user?.uid)
            return next(new errors_1.HttpError(401, "Not authenticated"));
        const { data, error } = await supabase_1.supabase
            .from("users")
            .select("subscription")
            .eq("id", user.uid)
            .single();
        if (error || !data)
            return next(new errors_1.HttpError(403, "User not found"));
        if (data.subscription !== "premium") {
            return next(new errors_1.HttpError(403, "Premium subscription required"));
        }
        next();
    }
    catch (err) {
        next(new errors_1.HttpError(500, "Failed to verify subscription"));
    }
};
exports.requirePremium = requirePremium;
//# sourceMappingURL=premium.js.map