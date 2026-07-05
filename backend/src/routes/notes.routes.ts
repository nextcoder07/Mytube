// src/routes/notes.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  generateFlashcards,
} from "../controllers/notes.controller";

const router = Router();

router.use(authenticate);

// Standard CRUD
router.get("/", getNotes);
router.get("/:id", getNote);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

// AI Flashcards
router.post("/:id/flashcards", generateFlashcards);

export default router;
