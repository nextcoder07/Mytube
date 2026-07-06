"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.curatePlaylist = curatePlaylist;
const prompt_1 = require("./prompt");
async function curatePlaylist(gateway, input) {
    const prompt = await prompt_1.PromptBuilder.build('playlist', {
        goal: input.goal,
        level: input.level,
        candidates: JSON.stringify(input.candidates, null, 2),
    });
    const raw = await gateway.generate(prompt);
    try {
        return JSON.parse(raw);
    }
    catch {
        return {
            title: `${input.goal} Learning Path`,
            description: 'AI-curated playlist',
            contentIds: input.candidates.slice(0, 10).map((c) => c.id),
        };
    }
}
//# sourceMappingURL=playlist.js.map