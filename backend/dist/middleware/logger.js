"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// src/middleware/logger.ts
const winston_1 = __importDefault(require("winston"));
const express_winston_1 = __importDefault(require("express-winston"));
exports.logger = express_winston_1.default.logger({
    transports: [new winston_1.default.transports.Console()],
    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.json()),
    meta: true,
    msg: "{{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false,
});
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map