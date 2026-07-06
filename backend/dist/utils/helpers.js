"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.truncate = exports.safeJsonParse = exports.sleep = exports.generateId = void 0;
const crypto_1 = __importDefault(require("crypto"));
/** Generate a new UUID v4 */
const generateId = () => crypto_1.default.randomUUID();
exports.generateId = generateId;
/** Sleep for a given number of milliseconds */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.sleep = sleep;
/** Safely parse JSON, returning null on failure */
const safeJsonParse = (str) => {
    try {
        return JSON.parse(str);
    }
    catch {
        return null;
    }
};
exports.safeJsonParse = safeJsonParse;
/** Truncate a string to maxLength, appending "..." */
const truncate = (str, maxLength) => str.length > maxLength ? str.slice(0, maxLength - 3) + "..." : str;
exports.truncate = truncate;
//# sourceMappingURL=helpers.js.map