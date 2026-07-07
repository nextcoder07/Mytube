"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const app_1 = __importDefault(require("./app"));
const index_1 = __importDefault(require("./config/index"));
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app_1.default);
const PORT = process.env.PORT || index_1.default.port || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map