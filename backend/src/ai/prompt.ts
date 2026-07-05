// src/ai/prompt.ts
import fs from "fs";
import path from "path";

/**
 * Loads a prompt template from src/prompts/<name>.txt and replaces placeholders.
 * Example: buildPrompt('chat', { goal: 'Learn React', level: 'Beginner' })
 */
export function buildPrompt(name: string, data: Record<string, string>): string {
  const filePath = path.join(__dirname, "..", "prompts", `${name}.txt`);
  let template = "";

  try {
    template = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
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

export const PromptBuilder = {
  build: buildPrompt,
};
