"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/playlist.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const playlist_controller_1 = require("../controllers/playlist.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// AI Generator route
router.post("/ai-generate", playlist_controller_1.generateAIPlaylist);
// Standard CRUD
router.get("/", playlist_controller_1.getPlaylists);
router.get("/:id", playlist_controller_1.getPlaylist);
router.post("/", playlist_controller_1.createPlaylist);
router.delete("/:id", playlist_controller_1.deletePlaylist);
// Playlist Items
router.post("/:id/items", playlist_controller_1.addPlaylistItem);
router.delete("/:id/items/:contentId", playlist_controller_1.removePlaylistItem);
exports.default = router;
//# sourceMappingURL=playlist.routes.js.map