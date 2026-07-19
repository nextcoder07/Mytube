// src/services/summary.service.ts
import { supabase } from "../utils/supabase";
import redis from "../config/redis";
import AIGateway from "../ai/gateway";
import { buildPrompt } from "../ai/prompt";

export interface SummaryOptions {
  transcript?: string;
  visualNotes?: string;
}

export class SummaryService {
  /**
   * Get AI summary for content using cache-first pattern (DB -> Redis -> AI generation).
   */
  static async getContentSummary(userId: string, contentId: string, options: SummaryOptions = {}) {
    const extraContext = {
      transcript: options.transcript?.trim() || "",
      visualNotes: options.visualNotes?.trim() || "",
    };

    const hasCustomContext = Boolean(extraContext.transcript || extraContext.visualNotes);

    if (!hasCustomContext) {
      // 1. Check DB summaries table
      const { data: dbSummary, error: dbError } = await supabase
        .from("summaries")
        .select("*")
        .eq("content_id", contentId)
        .single();

      if (dbSummary) {
        return {
          summary: dbSummary.summary,
          keyPoints: dbSummary.key_points,
          cached: true,
          source: "database",
        };
      }

      // 2. Check Redis cache
      const cacheKey = `summary:${contentId}`;
      try {
        const cachedVal = await redis.get(cacheKey);
        if (cachedVal) {
          const parsed = JSON.parse(cachedVal);
          // Persist back to DB asynchronously so it's faster next time
          this.saveSummaryToDb(contentId, parsed.summary, parsed.keyPoints).catch((e) =>
            console.error("Failed to async save summary to DB:", e.message)
          );
          return {
            ...parsed,
            cached: true,
            source: "redis",
          };
        }
      } catch (redisErr: any) {
        console.warn("Redis read error in summary service:", redisErr.message);
      }
    }

    // 3. Fetch content details to summarize
    const { data: content, error: contentError } = await supabase
      .from("content")
      .select("*")
      .eq("id", contentId)
      .single();

    if (contentError || !content) {
      throw new Error(`Content item ${contentId} not found in DB`);
    }

    // 4. Build prompt & call AI Gateway
    const prompt = buildPrompt("summary", {
      title: content.title,
      description: content.description || "No description provided.",
      url: content.url,
      transcript: extraContext.transcript || "No transcript or captions provided.",
      visualNotes: extraContext.visualNotes || "No visual notes or screenshot timestamps provided.",
    });

    const aiResponse = await AIGateway.generate(prompt);
    let parsed: { summary: string; key_points: string[] };

    try {
      parsed = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
    } catch (err: any) {
      console.error("Summary parsing failed. Raw response was:", aiResponse);
      throw new Error("AI was unable to generate a structured summary.");
    }

    const summaryText = parsed.summary;
    const keyPointsArray = parsed.key_points || [];

    if (!hasCustomContext) {
      // 5. Store to DB & Redis Cache for generic summaries
      this.saveSummaryToDb(contentId, summaryText, keyPointsArray).catch((e) =>
        console.error("Failed to save summary to DB:", e.message)
      );

      try {
        const cacheVal = JSON.stringify({ summary: summaryText, keyPoints: keyPointsArray });
        await redis.set(`summary:${contentId}`, cacheVal, "EX", 7 * 24 * 3600); // 7 days TTL
      } catch (redisErr: any) {
        console.warn("Redis write error in summary service:", redisErr.message);
      }
    }

    return {
      summary: summaryText,
      keyPoints: keyPointsArray,
      cached: false,
      source: hasCustomContext ? "ai-custom" : "ai",
    };
  }

  private static async saveSummaryToDb(contentId: string, summary: string, keyPoints: string[]) {
    await supabase.from("summaries").upsert(
      {
        content_id: contentId,
        summary,
        key_points: keyPoints,
      },
      { onConflict: "content_id" }
    );
  }
}

export default SummaryService;
