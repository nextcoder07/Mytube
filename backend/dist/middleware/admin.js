"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const errors_1 = require("../utils/errors");
const supabase_1 = require("../utils/supabase");
/** Require the authenticated user to have role = 'admin' */
const requireAdmin = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user?.uid)
            return next(new errors_1.HttpError(401, "Not authenticated"));
        const { data, error } = await supabase_1.supabase
            .from("users")
            .select("role")
            .eq("id", user.uid)
            .single();
        if (error || !data)
            return next(new errors_1.HttpError(403, "User not found"));
        if (data.role !== "admin")
            return next(new errors_1.HttpError(403, "Admin access required"));
        next();
    }
    catch (err) {
        next(new errors_1.HttpError(500, "Failed to verify admin role"));
    }
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=admin.js.map