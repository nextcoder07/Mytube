import { Router } from "express";
import debugController from "../controllers/debug.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Protect debug routes with authentication (still safe for dev)
router.use(authenticate);

router.get("/provider-keys", debugController.providerKeyStatus);
router.get("/status", debugController.debugStatus);

export default router;
