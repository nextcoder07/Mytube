"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserProfile = exports.getUserProfile = void 0;
const user_service_1 = __importDefault(require("../services/user.service"));
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const getUserProfile = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const profile = await user_service_1.default.getProfile(user.uid);
        res.status(200).json((0, response_1.success)(profile, "Profile fetched"));
    }
    catch (err) {
        next(err);
    }
};
exports.getUserProfile = getUserProfile;
const updateUserProfile = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const updated = await user_service_1.default.updateProfile(user.uid, req.body);
        res.status(200).json((0, response_1.success)(updated, "Profile updated successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.updateUserProfile = updateUserProfile;
const deleteUser = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        await user_service_1.default.deleteUser(user.uid);
        res.status(200).json((0, response_1.success)(null, "User deleted successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=user.controller.js.map