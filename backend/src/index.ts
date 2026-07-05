// src/index.ts
import app from "./app";
import config from "./config/index";
import http from "http";

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
