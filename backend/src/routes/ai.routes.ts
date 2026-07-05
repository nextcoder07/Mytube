// src/routes/ai.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { chatLimiter } from "../middleware/rateLimiter";
import {
  createChatSession,
  getChatSessions,
  getChatMessages,
  chatMessage,
} from "../controllers/ai.controller";

const router = Router();

router.use(authenticate);
router.use(chatLimiter);

router.post("/chat/sessions", createChatSession);
router.get("/chat/sessions", getChatSessions);
router.get("/chat/sessions/:id/messages", getChatMessages);
router.post("/chat/sessions/:id", chatMessage);

export default router;
