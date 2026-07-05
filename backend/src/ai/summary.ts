// src/ai/summary.ts — Summarization logic
import { AIGateway } from './gateway';
import { PromptBuilder } from './prompt';

export interface SummaryInput {
  title: string;
  description: string;
  url: string;
}

export interface SummaryOutput {
  summary: string;
  key_points: string[];
}

export async function generateSummary(
  gateway: AIGateway,
  input: SummaryInput,
): Promise<SummaryOutput> {
  const prompt = await PromptBuilder.build('summary', {
    title: input.title,
    description: input.description,
    url: input.url,
  });

  const raw = await gateway.generate(prompt);

  try {
    return JSON.parse(raw) as SummaryOutput;
  } catch {
    // Fallback if the model doesn't return valid JSON
    return { summary: raw, key_points: [] };
  }
}
