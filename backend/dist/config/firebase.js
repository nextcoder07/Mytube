"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = void 0;
// src/config/firebase.ts
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const index_1 = __importDefault(require("./index"));
// Initialize Firebase Admin SDK using modular subpaths or mock if key is placeholder
let firebaseAuth;
const isPlaceholderKey = !index_1.default.firebasePrivateKey ||
    index_1.default.firebasePrivateKey.includes("YOUR_PRIVATE_KEY") ||
    index_1.default.firebaseProjectId.includes("your-firebase-project-id");
if (isPlaceholderKey) {
    console.warn("⚠️ Firebase configuration is not set or using placeholders. Using MOCK Firebase Admin SDK.");
    exports.firebaseAuth = firebaseAuth = {
        verifyIdToken: async (idToken) => {
            console.log(`[Mock Firebase Admin] Verifying token: ${idToken}`);
            return {
                uid: "mock-user-123",
                email: "mock@example.com",
                name: "Mock User",
                picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
            };
        },
    };
}
else {
    try {
        if (!(0, app_1.getApps)().length) {
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)({
                    projectId: index_1.default.firebaseProjectId,
                    clientEmail: index_1.default.firebaseClientEmail,
                    privateKey: index_1.default.firebasePrivateKey.replace(/\\n/g, "\n"),
                }),
            });
        }
        exports.firebaseAuth = firebaseAuth = (0, auth_1.getAuth)();
    }
    catch (err) {
        console.error("⚠️ Failed to initialize Firebase Admin SDK. Falling back to MOCK Firebase Admin.", err.message);
        exports.firebaseAuth = firebaseAuth = {
            verifyIdToken: async (idToken) => {
                return {
                    uid: "mock-user-123",
                    email: "mock@example.com",
                    name: "Mock User",
                    picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
                };
            },
        };
    }
}
exports.default = firebaseAuth;
//# sourceMappingURL=firebase.js.map