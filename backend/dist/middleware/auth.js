"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const firebase_1 = require("../config/firebase");
const errors_1 = require("../utils/errors");
const config_1 = __importDefault(require("../config"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    // Detect if Firebase setup is mock or placeholder
    const isPlaceholderKey = !config_1.default.firebasePrivateKey ||
        config_1.default.firebasePrivateKey.includes("YOUR_PRIVATE_KEY") ||
        config_1.default.firebaseProjectId.includes("your-firebase-project-id");
    if (!authHeader?.startsWith("Bearer ")) {
        if (config_1.default.nodeEnv === "development" || isPlaceholderKey) {
            // Auto-inject mock user for development ease
            req.user = { uid: "mock-user-123", email: "mock@example.com" };
            return next();
        }
        return next(new errors_1.HttpError(401, "Missing or invalid Authorization header"));
    }
    const idToken = authHeader.split(" ")[1];
    try {
        if (config_1.default.nodeEnv === "development") {
            console.debug("[auth] Authorization header present (dev). Verifying token...");
        }
        const decoded = await firebase_1.firebaseAuth.verifyIdToken(idToken);
        // Attach user info to request
        req.user = { uid: decoded.uid, email: decoded.email };
        if (config_1.default.nodeEnv === "development") {
            console.debug(`[auth] Token verified. uid=${decoded.uid}, email=${decoded.email}`);
        }
        next();
    }
    catch (err) {
        if (config_1.default.nodeEnv === "development" || isPlaceholderKey) {
            console.warn("⚠️ Firebase ID Token verification failed. Falling back to mock user in development.");
            req.user = { uid: "mock-user-123", email: "mock@example.com" };
            return next();
        }
        const errMsg = err && typeof err === 'object' && 'message' in err ? err.message : String(err);
        console.error("Firebase auth error:", errMsg);
        next(new errors_1.HttpError(401, "Invalid Firebase ID token"));
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map