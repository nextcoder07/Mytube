"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/ai.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use(rateLimiter_1.chatLimiter);
router.post("/chat/sessions", ai_controller_1.createChatSession);
router.get("/chat/sessions", ai_controller_1.getChatSessions);
router.get("/chat/sessions/:id/messages", ai_controller_1.getChatMessages);
router.post("/chat/sessions/:id", ai_controller_1.chatMessage);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map