"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIPlaylist = exports.deletePlaylist = exports.removePlaylistItem = exports.addPlaylistItem = exports.createPlaylist = exports.getPlaylist = exports.getPlaylists = void 0;
const playlist_service_1 = __importDefault(require("../services/playlist.service"));
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const getPlaylists = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const playlists = await playlist_service_1.default.getPlaylists(user.uid);
        res.status(200).json((0, response_1.success)(playlists, "Playlists fetched"));
    }
    catch (err) {
        next(err);
    }
};
exports.getPlaylists = getPlaylists;
const getPlaylist = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const playlist = await playlist_service_1.default.getPlaylist(user.uid, req.params.id);
        res.status(200).json((0, response_1.success)(playlist, "Playlist fetched"));
    }
    catch (err) {
        next(err);
    }
};
exports.getPlaylist = getPlaylist;
const createPlaylist = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const playlist = await playlist_service_1.default.createPlaylist(user.uid, req.body);
        res.status(201).json((0, response_1.success)(playlist, "Playlist created successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.createPlaylist = createPlaylist;
const addPlaylistItem = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const { contentId } = req.body;
        if (!contentId) {
            return next(new errors_1.HttpError(400, "contentId is required"));
        }
        const item = await playlist_service_1.default.addPlaylistItem(user.uid, req.params.id, contentId);
        res.status(201).json((0, response_1.success)(item, "Content added to playlist"));
    }
    catch (err) {
        next(err);
    }
};
exports.addPlaylistItem = addPlaylistItem;
const removePlaylistItem = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        await playlist_service_1.default.removePlaylistItem(user.uid, req.params.id, req.params.contentId);
        res.status(200).json((0, response_1.success)(null, "Content removed from playlist"));
    }
    catch (err) {
        next(err);
    }
};
exports.removePlaylistItem = removePlaylistItem;
const deletePlaylist = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        await playlist_service_1.default.deletePlaylist(user.uid, req.params.id);
        res.status(200).json((0, response_1.success)(null, "Playlist deleted successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.deletePlaylist = deletePlaylist;
const generateAIPlaylist = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const { topic } = req.body;
        if (!topic) {
            return next(new errors_1.HttpError(400, "Topic parameter is required"));
        }
        const playlist = await playlist_service_1.default.generateAIPlaylist(user.uid, topic);
        res.status(201).json((0, response_1.success)(playlist, "AI playlist generated successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.generateAIPlaylist = generateAIPlaylist;
//# sourceMappingURL=playlist.controller.js.map