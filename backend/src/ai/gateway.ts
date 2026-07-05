// src/ai/gateway.ts
import config from "../config/index";

export interface Message {
  role: "user" | "assistant" | "model";
  content: string;
}

export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
}

export class AIGateway {
  /**
   * Universal text generation method
   */
  static async generate(prompt: string, options?: AIOptions): Promise<string> {
    const provider = config.aiProvider;

    if (provider === "gemini") {
      return this.callGemini(prompt, options);
    } else {
      return this.callOpenRouter(prompt, options);
    }
  }

  /**
   * Universal chat interface
   */
  static async chat(messages: Message[], options?: AIOptions): Promise<string> {
    const provider = config.aiProvider;

    if (provider === "gemini") {
      return this.callGeminiChat(messages, options);
    } else {
      return this.callOpenRouterChat(messages, options);
    }
  }

  /**
   * Instance delegate for generate
   */
  async generate(prompt: string, options?: AIOptions): Promise<string> {
    return AIGateway.generate(prompt, options);
  }

  /**
   * Instance delegate for chat
   */
  async chat(messages: Message[], options?: AIOptions): Promise<string> {
    return AIGateway.chat(messages, options);
  }

  private static async callGemini(prompt: string, options?: AIOptions): Promise<string> {
    const key = config.geminiApiKey;
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

      const resJson: any = await response.json();
      const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Invalid response format from Gemini API");
      }
      return text;
    } catch (err: any) {
      console.error("Gemini Generate Error:", err.message);
      // Fallback to OpenRouter if configured
      if (config.openrouterApiKey && config.openrouterApiKey !== "your-openrouter-api-key") {
        console.warn("Attempting OpenRouter fallback...");
        return this.callOpenRouter(prompt, options);
      }
      throw err;
    }
  }

  private static async callGeminiChat(messages: Message[], options?: AIOptions): Promise<string> {
    const key = config.geminiApiKey;
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

      const resJson: any = await response.json();
      const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Invalid response format from Gemini Chat API");
      }
      return text;
    } catch (err: any) {
      console.error("Gemini Chat Error:", err.message);
      if (config.openrouterApiKey && config.openrouterApiKey !== "your-openrouter-api-key") {
        console.warn("Attempting OpenRouter fallback for chat...");
        return this.callOpenRouterChat(messages, options);
      }
      throw err;
    }
  }

  private static async callOpenRouter(prompt: string, options?: AIOptions): Promise<string> {
    const key = config.openrouterApiKey;
    const url = "https://openrouter.ai/api/v1/chat/completions";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": config.frontendUrl,
          "X-Title": "MyTube Personalized Learning Platform",
        },
        body: JSON.stringify({
          model: config.openrouterModel,
          messages: [{ role: "user", content: prompt }],
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API returned status ${response.status}: ${errorText}`);
      }

      const resJson: any = await response.json();
      const text = resJson?.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("Invalid response format from OpenRouter API");
      }
      return text;
    } catch (err: any) {
      console.error("OpenRouter Generate Error:", err.message);
      throw err;
    }
  }

  private static async callOpenRouterChat(messages: Message[], options?: AIOptions): Promise<string> {
    const key = config.openrouterApiKey;
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
          "HTTP-Referer": config.frontendUrl,
          "X-Title": "MyTube Personalized Learning Platform",
        },
        body: JSON.stringify({
          model: config.openrouterModel,
          messages: formattedMessages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API returned status ${response.status}: ${errorText}`);
      }

      const resJson: any = await response.json();
      const text = resJson?.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("Invalid response format from OpenRouter Chat API");
      }
      return text;
    } catch (err: any) {
      console.error("OpenRouter Chat Error:", err.message);
      throw err;
    }
  }
}

export default AIGateway;
