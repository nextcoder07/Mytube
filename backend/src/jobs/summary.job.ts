// src/jobs/summary.job.ts — Worker: pre-generate summaries for new content
import { Worker } from 'bullmq';
import redis from '../config/redis';
import { AIGateway } from '../ai/gateway';
import { generateSummary } from '../ai/summary';
import { supabase } from '../config/supabase';

const gateway = new AIGateway();

export const summaryWorker = new Worker(
  'summary',
  async (job) => {
    const { contentId, title, description, url } = job.data as {
      contentId: string;
      title: string;
      description: string;
      url: string;
    };

    const result = await generateSummary(gateway, { title, description, url });

    await supabase.from('summaries').upsert({
      content_id: contentId,
      summary_text: result.summary,
      key_points: result.key_points,
      model_used: process.env.AI_PROVIDER ?? 'gemini',
    });
  },
  { connection: redis },
);
