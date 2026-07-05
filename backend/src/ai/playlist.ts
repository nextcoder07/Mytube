// src/ai/playlist.ts — AI playlist curation logic
import { AIGateway } from './gateway';
import { PromptBuilder } from './prompt';
import { Content } from '../models/content.model';

export interface PlaylistCurationInput {
  goal: string;
  level: string;
  candidates: Pick<Content, 'id' | 'title' | 'source' | 'type' | 'description'>[];
}

export interface CuratedPlaylist {
  title: string;
  description: string;
  contentIds: string[];
}

export async function curatePlaylist(
  gateway: AIGateway,
  input: PlaylistCurationInput,
): Promise<CuratedPlaylist> {
  const prompt = await PromptBuilder.build('playlist', {
    goal: input.goal,
    level: input.level,
    candidates: JSON.stringify(input.candidates, null, 2),
  });

  const raw = await gateway.generate(prompt);

  try {
    return JSON.parse(raw) as CuratedPlaylist;
  } catch {
    return {
      title: `${input.goal} Learning Path`,
      description: 'AI-curated playlist',
      contentIds: input.candidates.slice(0, 10).map((c) => c.id),
    };
  }
}
