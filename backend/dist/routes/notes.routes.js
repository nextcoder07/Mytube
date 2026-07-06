"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/notes.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const notes_controller_1 = require("../controllers/notes.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Standard CRUD
router.get("/", notes_controller_1.getNotes);
router.get("/:id", notes_controller_1.getNote);
router.post("/", notes_controller_1.createNote);
router.put("/:id", notes_controller_1.updateNote);
router.delete("/:id", notes_controller_1.deleteNote);
// AI Flashcards
router.post("/:id/flashcards", notes_controller_1.generateFlashcards);
exports.default = router;
//# sourceMappingURL=notes.routes.js.map