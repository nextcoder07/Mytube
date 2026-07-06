"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
// src/middleware/cors.ts
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("../config/index"));
exports.corsMiddleware = (0, cors_1.default)({
    origin: index_1.default.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});
//# sourceMappingURL=cors.js.map