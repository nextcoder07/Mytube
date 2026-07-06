"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/analytics.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const analytics_controller_1 = require("../controllers/analytics.controller");
const router = (0, express_1.Router)();
// Allow optional auth for event logging, but stats require auth
router.post("/", (req, res, next) => {
    if (req.headers.authorization) {
        return (0, auth_1.authenticate)(req, res, next);
    }
    next();
}, analytics_controller_1.logEvent);
router.get("/stats", auth_1.authenticate, analytics_controller_1.getUserStats);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map