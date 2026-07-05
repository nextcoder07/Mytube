// src/ai/roadmap.ts — Roadmap generation logic
import { AIGateway } from './gateway';
import { PromptBuilder } from './prompt';

export interface RoadmapInput {
  goal: string;
  level: string;
  timePerWeek: number; // hours
  targetDate?: string;
}

export interface RoadmapPhase {
  title: string;
  duration: string;
  topics: string[];
  resources: string[];
}

export interface RoadmapOutput {
  phases: RoadmapPhase[];
}

export async function generateRoadmap(
  gateway: AIGateway,
  input: RoadmapInput,
): Promise<RoadmapOutput> {
  const prompt = await PromptBuilder.build('roadmap', {
    goal: input.goal,
    level: input.level,
    timePerWeek: String(input.timePerWeek),
    targetDate: input.targetDate ?? 'not specified',
  });

  const raw = await gateway.generate(prompt);

  try {
    return JSON.parse(raw) as RoadmapOutput;
  } catch {
    return { phases: [] };
  }
}
