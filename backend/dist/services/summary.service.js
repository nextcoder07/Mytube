"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummaryService = void 0;
// src/services/summary.service.ts
const supabase_1 = require("../utils/supabase");
const redis_1 = __importDefault(require("../config/redis"));
const gateway_1 = __importDefault(require("../ai/gateway"));
const prompt_1 = require("../ai/prompt");
class SummaryService {
    /**
     * Get AI summary for content using cache-first pattern (DB -> Redis -> AI generation).
     */
    static async getContentSummary(userId, contentId) {
        // 1. Check DB summaries table
        const { data: dbSummary, error: dbError } = await supabase_1.supabase
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
            const cachedVal = await redis_1.default.get(cacheKey);
            if (cachedVal) {
                const parsed = JSON.parse(cachedVal);
                // Persist back to DB asynchronously so it's faster next time
                this.saveSummaryToDb(contentId, parsed.summary, parsed.keyPoints).catch((e) => console.error("Failed to async save summary to DB:", e.message));
                return {
                    ...parsed,
                    cached: true,
                    source: "redis",
                };
            }
        }
        catch (redisErr) {
            console.warn("Redis read error in summary service:", redisErr.message);
        }
        // 3. Cache miss: Fetch content details to summarize
        const { data: content, error: contentError } = await supabase_1.supabase
            .from("content")
            .select("*")
            .eq("id", contentId)
            .single();
        if (contentError || !content) {
            throw new Error(`Content item ${contentId} not found in DB`);
        }
        // 4. Build prompt & call AI Gateway
        const prompt = (0, prompt_1.buildPrompt)("summary", {
            title: content.title,
            description: content.description || "No description provided.",
            url: content.url,
        });
        const aiResponse = await gateway_1.default.generate(prompt);
        let parsed;
        try {
            parsed = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
        }
        catch (err) {
            console.error("Summary parsing failed. Raw response was:", aiResponse);
            throw new Error("AI was unable to generate a structured summary.");
        }
        const summaryText = parsed.summary;
        const keyPointsArray = parsed.key_points || [];
        // 5. Store to DB & Redis Cache
        this.saveSummaryToDb(contentId, summaryText, keyPointsArray).catch((e) => console.error("Failed to save summary to DB:", e.message));
        try {
            const cacheVal = JSON.stringify({ summary: summaryText, keyPoints: keyPointsArray });
            await redis_1.default.set(cacheKey, cacheVal, "EX", 7 * 24 * 3600); // 7 days TTL (plan.md section 12)
        }
        catch (redisErr) {
            console.warn("Redis write error in summary service:", redisErr.message);
        }
        return {
            summary: summaryText,
            keyPoints: keyPointsArray,
            cached: false,
            source: "ai",
        };
    }
    static async saveSummaryToDb(contentId, summary, keyPoints) {
        await supabase_1.supabase.from("summaries").upsert({
            content_id: contentId,
            summary,
            key_points: keyPoints,
        }, { onConflict: "content_id" });
    }
}
exports.SummaryService = SummaryService;
exports.default = SummaryService;
//# sourceMappingURL=summary.service.js.map