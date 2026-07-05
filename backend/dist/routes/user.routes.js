"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/user.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get("/", user_controller_1.getUserProfile);
router.put("/", user_controller_1.updateUserProfile);
router.delete("/", user_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map