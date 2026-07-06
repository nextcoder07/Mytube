"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIGateway = void 0;
// src/ai/gateway.ts
const index_1 = __importDefault(require("../config/index"));
class AIGateway {
    /**
     * Universal text generation method
     */
    static async generate(prompt, options) {
        const provider = index_1.default.aiProvider;
        if (provider === "gemini") {
            return this.callGemini(prompt, options);
        }
        else {
            return this.callOpenRouter(prompt, options);
        }
    }
    /**
     * Universal chat interface
     */
    static async chat(messages, options) {
        const provider = index_1.default.aiProvider;
        if (provider === "gemini") {
            return this.callGeminiChat(messages, options);
        }
        else {
            return this.callOpenRouterChat(messages, options);
        }
    }
    /**
     * Instance delegate for generate
     */
    async generate(prompt, options) {
        return AIGateway.generate(prompt, options);
    }
    /**
     * Instance delegate for chat
     */
    async chat(messages, options) {
        return AIGateway.chat(messages, options);
    }
    static async callGemini(prompt, options) {
        const key = index_1.default.geminiApiKey;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: options?.temperature ?? 0.7,
                        maxOutputTokens: options?.maxTokens ?? 2048,
                    },
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
            }
            const resJson = await response.json();
            const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error("Invalid response format from Gemini API");
            }
            return text;
        }
        catch (err) {
            console.error("Gemini Generate Error:", err.message);
            // Fallback to OpenRouter if configured
            if (index_1.default.openrouterApiKey && index_1.default.openrouterApiKey !== "your-openrouter-api-key") {
                console.warn("Attempting OpenRouter fallback...");
                return this.callOpenRouter(prompt, options);
            }
            throw err;
        }
    }
    static async callGeminiChat(messages, options) {
        const key = index_1.default.geminiApiKey;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
        // Normalize roles: Gemini expects 'user' or 'model'
        const contents = messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: options?.temperature ?? 0.7,
                        maxOutputTokens: options?.maxTokens ?? 2048,
                    },
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
            }
            const resJson = await response.json();
            const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error("Invalid response format from Gemini Chat API");
            }
            return text;
        }
        catch (err) {
            console.error("Gemini Chat Error:", err.message);
            if (index_1.default.openrouterApiKey && index_1.default.openrouterApiKey !== "your-openrouter-api-key") {
                console.warn("Attempting OpenRouter fallback for chat...");
                return this.callOpenRouterChat(messages, options);
            }
            throw err;
        }
    }
    static async callOpenRouter(prompt, options) {
        const key = index_1.default.openrouterApiKey;
        const url = "https://openrouter.ai/api/v1/chat/completions";
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${key}`,
                    "HTTP-Referer": index_1.default.frontendUrl,
                    "X-Title": "MyTube Personalized Learning Platform",
                },
                body: JSON.stringify({
                    model: index_1.default.openrouterModel,
                    messages: [{ role: "user", content: prompt }],
                    temperature: options?.temperature ?? 0.7,
                    max_tokens: options?.maxTokens ?? 2048,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API returned status ${response.status}: ${errorText}`);
            }
            const resJson = await response.json();
            const text = resJson?.choices?.[0]?.message?.content;
            if (!text) {
                throw new Error("Invalid response format from OpenRouter API");
            }
            return text;
        }
        catch (err) {
            console.error("OpenRouter Generate Error:", err.message);
            throw err;
        }
    }
    static async callOpenRouterChat(messages, options) {
        const key = index_1.default.openrouterApiKey;
        const url = "https://openrouter.ai/api/v1/chat/completions";
        // Normalize roles: OpenRouter expects 'user' or 'assistant'
        const formattedMessages = messages.map((m) => ({
            role: m.role === "model" ? "assistant" : m.role,
            content: m.content,
        }));
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${key}`,
                    "HTTP-Referer": index_1.default.frontendUrl,
                    "X-Title": "MyTube Personalized Learning Platform",
                },
                body: JSON.stringify({
                    model: index_1.default.openrouterModel,
                    messages: formattedMessages,
                    temperature: options?.temperature ?? 0.7,
                    max_tokens: options?.maxTokens ?? 2048,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API returned status ${response.status}: ${errorText}`);
            }
            const resJson = await response.json();
            const text = resJson?.choices?.[0]?.message?.content;
            if (!text) {
                throw new Error("Invalid response format from OpenRouter Chat API");
            }
            return text;
        }
        catch (err) {
            console.error("OpenRouter Chat Error:", err.message);
            throw err;
        }
    }
}
exports.AIGateway = AIGateway;
exports.default = AIGateway;
//# sourceMappingURL=gateway.js.map