"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyIdToken = verifyIdToken;
// src/auth/firebase.auth.ts — Firebase Admin token verification
const firebase_1 = require("../config/firebase");
async function verifyIdToken(idToken) {
    const decoded = await firebase_1.firebaseAuth.verifyIdToken(idToken);
    return {
        uid: decoded.uid,
        email: decoded.email ?? '',
        name: decoded.name,
        picture: decoded.picture,
    };
}
//# sourceMappingURL=firebase.auth.js.map