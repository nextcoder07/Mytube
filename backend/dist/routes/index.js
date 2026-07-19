"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/index.ts
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const goals_routes_1 = __importDefault(require("./goals.routes"));
const search_routes_1 = __importDefault(require("./search.routes"));
const feed_routes_1 = __importDefault(require("./feed.routes"));
const playlist_routes_1 = __importDefault(require("./playlist.routes"));
const notes_routes_1 = __importDefault(require("./notes.routes"));
const summary_routes_1 = __importDefault(require("./summary.routes"));
const ai_routes_1 = __importDefault(require("./ai.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const status_routes_1 = __importDefault(require("./status.routes"));
const debug_routes_1 = __importDefault(require("./debug.routes"));
const history_routes_1 = __importDefault(require("./history.routes"));
const config_1 = __importDefault(require("../config"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
// Mount debug routes only in development
if (config_1.default.nodeEnv === "development") {
    router.use("/debug", debug_routes_1.default);
}
router.use("/user", user_routes_1.default);
router.use("/goals", goals_routes_1.default);
router.use("/search", search_routes_1.default);
router.use("/feed", feed_routes_1.default);
router.use("/playlist", playlist_routes_1.default);
router.use("/notes", notes_routes_1.default);
router.use("/summary", summary_routes_1.default);
router.use("/ai", ai_routes_1.default);
router.use("/analytics", analytics_routes_1.default);
router.use("/history", history_routes_1.default);
router.use('/status', status_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map