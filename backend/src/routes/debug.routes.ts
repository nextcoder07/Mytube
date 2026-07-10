import { Router } from "express";
import debugController from "../controllers/debug.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/provider-keys", requireAuth, debugController.providerKeyStatus);

export default router;
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { debugStatus } from "../controllers/debug.controller";

const router = Router();

// Protect debug routes with authentication (still safe for dev)
router.use(authenticate);

router.get("/status", debugStatus);

export default router;
