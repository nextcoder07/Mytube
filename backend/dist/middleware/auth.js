"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const firebase_1 = require("../config/firebase");
const errors_1 = require("../utils/errors");
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return next(new errors_1.HttpError(401, "Missing or invalid Authorization header"));
    }
    const idToken = authHeader.split(" ")[1];
    try {
        const decoded = await firebase_1.firebaseAuth.verifyIdToken(idToken);
        // Attach user info to request
        req.user = { uid: decoded.uid, email: decoded.email };
        next();
    }
    catch (err) {
        console.error("Firebase auth error:", err);
        next(new errors_1.HttpError(401, "Invalid Firebase ID token"));
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map