"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const firebase_1 = require("../config/firebase");
const auth_service_1 = __importDefault(require("../services/auth.service"));
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const register = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return next(new errors_1.HttpError(400, "Missing Firebase ID Token"));
        }
        const decoded = await firebase_1.firebaseAuth.verifyIdToken(idToken);
        const user = await auth_service_1.default.resolveUser(decoded);
        res.status(201).json((0, response_1.success)({ user }, "User registered successfully"));
    }
    catch (err) {
        console.error("Register Error:", err.message);
        next(new errors_1.HttpError(401, "Authentication failed", err.message));
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return next(new errors_1.HttpError(400, "Missing Firebase ID Token"));
        }
        const decoded = await firebase_1.firebaseAuth.verifyIdToken(idToken);
        const user = await auth_service_1.default.resolveUser(decoded);
        res.status(200).json((0, response_1.success)({ user, token: idToken }, "Login successful"));
    }
    catch (err) {
        console.error("Login Error:", err.message);
        next(new errors_1.HttpError(401, "Invalid token or login failed", err.message));
    }
};
exports.login = login;
const logout = async (req, res, next) => {
    try {
        res.status(200).json((0, response_1.success)(null, "Logged out successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.logout = logout;
const user_service_1 = __importDefault(require("../services/user.service"));
const getCurrentUser = async (req, res, next) => {
    try {
        const firebaseUser = req.user;
        if (!firebaseUser) {
            return next(new errors_1.HttpError(401, "Not authenticated"));
        }
        // Fetch user with profile from database
        const user = await user_service_1.default.getProfile(firebaseUser.uid);
        res.status(200).json((0, response_1.success)(user, "Current user fetched"));
    }
    catch (err) {
        next(new errors_1.HttpError(404, "User not found or database error", err.message));
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=auth.controller.js.map