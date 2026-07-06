"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/summary.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const summary_controller_1 = require("../controllers/summary.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use(rateLimiter_1.summaryLimiter);
router.post("/", summary_controller_1.getContentSummary);
exports.default = router;
//# sourceMappingURL=summary.routes.js.map