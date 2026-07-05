"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = void 0;
// src/config/firebase.ts
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const index_1 = __importDefault(require("./index"));
// Initialize Firebase Admin SDK
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert({
            projectId: index_1.default.firebaseProjectId,
            clientEmail: index_1.default.firebaseClientEmail,
            // Private key must have newlines restored
            privateKey: index_1.default.firebasePrivateKey.replace(/\\n/g, "\n"),
        }),
    });
}
exports.firebaseAuth = firebase_admin_1.default.auth();
exports.default = exports.firebaseAuth;
//# sourceMappingURL=firebase.js.map