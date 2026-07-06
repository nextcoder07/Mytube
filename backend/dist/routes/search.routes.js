"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/search.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const search_controller_1 = require("../controllers/search.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use(rateLimiter_1.searchLimiter);
router.get("/", search_controller_1.search);
router.post("/ai", search_controller_1.searchAI);
router.get("/history", search_controller_1.getSearchHistory);
exports.default = router;
//# sourceMappingURL=search.routes.js.map