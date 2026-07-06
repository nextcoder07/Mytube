"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoadmap = generateRoadmap;
const prompt_1 = require("./prompt");
async function generateRoadmap(gateway, input) {
    const prompt = await prompt_1.PromptBuilder.build('roadmap', {
        goal: input.goal,
        level: input.level,
        timePerWeek: String(input.timePerWeek),
        targetDate: input.targetDate ?? 'not specified',
    });
    const raw = await gateway.generate(prompt);
    try {
        return JSON.parse(raw);
    }
    catch {
        return { phases: [] };
    }
}
//# sourceMappingURL=roadmap.js.map