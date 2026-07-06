"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFlashcards = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNote = exports.getNotes = void 0;
const notes_service_1 = __importDefault(require("../services/notes.service"));
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const getNotes = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const notes = await notes_service_1.default.getNotes(user.uid);
        res.status(200).json((0, response_1.success)(notes, "Notes fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getNotes = getNotes;
const getNote = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const note = await notes_service_1.default.getNote(user.uid, req.params.id);
        res.status(200).json((0, response_1.success)(note, "Note fetched successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.getNote = getNote;
const createNote = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const note = await notes_service_1.default.createNote(user.uid, req.body);
        res.status(201).json((0, response_1.success)(note, "Note created successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.createNote = createNote;
const updateNote = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const note = await notes_service_1.default.updateNote(user.uid, req.params.id, req.body);
        res.status(200).json((0, response_1.success)(note, "Note updated successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.updateNote = updateNote;
const deleteNote = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        await notes_service_1.default.deleteNote(user.uid, req.params.id);
        res.status(200).json((0, response_1.success)(null, "Note deleted successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteNote = deleteNote;
const generateFlashcards = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const flashcards = await notes_service_1.default.generateFlashcards(user.uid, req.params.id);
        res.status(200).json((0, response_1.success)(flashcards, "AI Flashcards generated successfully"));
    }
    catch (err) {
        next(err);
    }
};
exports.generateFlashcards = generateFlashcards;
//# sourceMappingURL=notes.controller.js.map