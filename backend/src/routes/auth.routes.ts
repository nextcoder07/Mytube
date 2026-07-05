import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { register, login, logout, getCurrentUser } from "../controllers/auth.controller";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected route example
router.get("/me", authenticate, getCurrentUser);

export default router;
