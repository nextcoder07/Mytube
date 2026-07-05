// src/middleware/logger.ts
import winston from "winston";
import expressWinston from "express-winston";

export const logger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.colorize(), winston.format.json()),
  meta: true,
  msg: "{{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
});

export default logger;
