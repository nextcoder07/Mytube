// src/index.ts
import app from "./app";
import config from "./config/index";
import http from "http";

const server = http.createServer(app);

const PORT = process.env.PORT || config.port || 4000;

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
