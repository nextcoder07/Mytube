"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptBuilder = void 0;
exports.buildPrompt = buildPrompt;
// src/ai/prompt.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Loads a prompt template from src/prompts/<name>.txt and replaces placeholders.
 * Example: buildPrompt('chat', { goal: 'Learn React', level: 'Beginner' })
 */
function buildPrompt(name, data) {
    const filePath = path_1.default.join(__dirname, "..", "prompts", `${name}.txt`);
    let template = "";
    try {
        template = fs_1.default.readFileSync(filePath, "utf-8");
    }
    catch (err) {
        console.error(`Prompt template ${name}.txt not found at ${filePath}. Falling back to empty string.`);
        template = "";
    }
    let prompt = template;
    for (const [key, value] of Object.entries(data)) {
        // Replace all occurrences of {{key}} with value
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        prompt = prompt.replace(regex, value);
    }
    return prompt;
}
exports.PromptBuilder = {
    build: buildPrompt,
};
//# sourceMappingURL=prompt.js.map