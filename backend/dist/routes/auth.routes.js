"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/logout", auth_controller_1.logout);
// Protected route example
router.get("/me", auth_1.authenticate, auth_controller_1.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map