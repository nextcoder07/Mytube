"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runChat = runChat;
const prompt_1 = require("./prompt");
async function runChat(gateway, options) {
    const systemPrompt = await prompt_1.PromptBuilder.build('chat', {
        goal: options.goal ?? 'general learning',
        level: options.level ?? 'intermediate',
        history: options.history
            .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
            .join('\n'),
        message: options.message,
    });
    const messages = [
        { role: 'user', content: systemPrompt },
    ];
    return gateway.chat(messages);
}
//# sourceMappingURL=chat.js.map