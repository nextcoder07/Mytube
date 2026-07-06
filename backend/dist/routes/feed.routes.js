"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/feed.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const feed_controller_1 = require("../controllers/feed.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", feed_controller_1.getFeed);
router.get("/recommended", feed_controller_1.getRecommended);
exports.default = router;
//# sourceMappingURL=feed.routes.js.map