"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
// src/config/supabase.ts
const supabase_js_1 = require("@supabase/supabase-js");
const index_1 = __importDefault(require("./index"));
exports.supabase = (0, supabase_js_1.createClient)(index_1.default.supabaseUrl, index_1.default.supabaseServiceKey);
exports.default = exports.supabase;
//# sourceMappingURL=supabase.js.map