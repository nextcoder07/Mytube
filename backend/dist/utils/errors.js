"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
// src/utils/errors.ts
class HttpError extends Error {
    statusCode;
    details;
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=errors.js.map