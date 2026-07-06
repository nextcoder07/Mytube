"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
// src/utils/response.ts
function success(data, message = "Success") {
    return { success: true, message, data, error: null };
}
function error(message, code, details) {
    return { success: false, message, data: null, error: { code, details } };
}
//# sourceMappingURL=response.js.map