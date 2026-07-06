"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSummary = generateSummary;
const prompt_1 = require("./prompt");
async function generateSummary(gateway, input) {
    const prompt = await prompt_1.PromptBuilder.build('summary', {
        title: input.title,
        description: input.description,
        url: input.url,
    });
    const raw = await gateway.generate(prompt);
    try {
        return JSON.parse(raw);
    }
    catch {
        // Fallback if the model doesn't return valid JSON
        return { summary: raw, key_points: [] };
    }
}
//# sourceMappingURL=summary.js.map