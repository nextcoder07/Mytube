// src/routes/playlist.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  addPlaylistItem,
  removePlaylistItem,
  deletePlaylist,
  generateAIPlaylist,
} from "../controllers/playlist.controller";

const router = Router();

router.use(authenticate);

// AI Generator route
router.post("/ai-generate", generateAIPlaylist);

// Standard CRUD
router.get("/", getPlaylists);
router.get("/:id", getPlaylist);
router.post("/", createPlaylist);
router.delete("/:id", deletePlaylist);

// Playlist Items
router.post("/:id/items", addPlaylistItem);
router.delete("/:id/items/:contentId", removePlaylistItem);

export default router;
