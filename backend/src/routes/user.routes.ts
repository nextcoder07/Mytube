// src/routes/user.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getUserProfile, updateUserProfile, deleteUser } from "../controllers/user.controller";

const router = Router();

router.use(authenticate);

router.get("/", getUserProfile);
router.put("/", updateUserProfile);
router.delete("/", deleteUser);

export default router;
