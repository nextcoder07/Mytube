// src/routes/index.ts
import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import goalsRouter from "./goals.routes";
import searchRouter from "./search.routes";
import feedRouter from "./feed.routes";
import playlistRouter from "./playlist.routes";
import notesRouter from "./notes.routes";
import summaryRouter from "./summary.routes";
import aiRouter from "./ai.routes";
import analyticsRouter from "./analytics.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/goals", goalsRouter);
router.use("/search", searchRouter);
router.use("/feed", feedRouter);
router.use("/playlist", playlistRouter);
router.use("/notes", notesRouter);
router.use("/summary", summaryRouter);
router.use("/ai", aiRouter);
router.use("/analytics", analyticsRouter);

export default router;
