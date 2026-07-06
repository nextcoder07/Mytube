"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
// src/services/search.service.ts
const providers_1 = __importDefault(require("../providers"));
const supabase_1 = require("../utils/supabase");
const gateway_1 = __importDefault(require("../ai/gateway"));
const index_1 = __importDefault(require("../config/index"));
/** Check if Supabase is actually configured (not placeholder values) */
function isSupabaseConfigured() {
    return (!!index_1.default.supabaseUrl &&
        !index_1.default.supabaseUrl.includes("your-supabase") &&
        !!index_1.default.supabaseServiceKey &&
        !index_1.default.supabaseServiceKey.includes("your-supabase"));
}
class SearchService {
    /**
     * Search providers, deduplicate, rank, save results, and log search history.
     */
    static async search(userId, query, options) {
        const providers = options?.providers || ["youtube", "github", "reddit", "medium", "website"];
        // 1. Fetch raw content from providers in parallel
        const rawResults = await providers_1.default.searchSelected(providers, query, options);
        // 2. Deduplicate by URL
        const uniqueMap = new Map();
        rawResults.forEach((item) => {
            if (!uniqueMap.has(item.url)) {
                uniqueMap.set(item.url, item);
            }
        });
        const deduplicated = Array.from(uniqueMap.values());
        // 3. Rank results
        const ranked = this.rankResults(deduplicated, query);
        // 4. Save search history & save new content records in DB asynchronously
        //    Only attempt if Supabase is properly configured
        if (isSupabaseConfigured()) {
            this.saveSearchHistory(userId, query, providers).catch((err) => console.error("Failed to save search history:", err.message));
            this.persistContent(ranked).catch((err) => console.error("Failed to persist content:", err.message));
        }
        return ranked;
    }
    /**
     * AI-enhanced search. Calls regular search, re-ranks using Gemini, and appends AI explanation.
     */
    static async searchAI(userId, query, options) {
        const results = await this.search(userId, query, options);
        if (results.length === 0)
            return [];
        // Check if AI is configured
        const aiConfigured = (index_1.default.aiProvider === "gemini" && index_1.default.geminiApiKey && !index_1.default.geminiApiKey.includes("your-")) ||
            (index_1.default.aiProvider === "openrouter" && index_1.default.openrouterApiKey && !index_1.default.openrouterApiKey.includes("your-"));
        if (!aiConfigured) {
            console.warn("⚠️ AI provider not configured. Returning results without AI re-ranking.");
            return results;
        }
        // Send top 10 results to AI for re-ranking and personalization explanation
        const topResults = results.slice(0, 10);
        const prompt = `
You are an expert tutor. Re-rank these content learning resources for the query: "${query}".
For each resource, explain in 1 sentence WHY it is highly relevant for a learner, and give a score from 1-10.

Resources:
${topResults.map((r, i) => `[ID: ${r.id}] Title: ${r.title} | Source: ${r.source} | Description: ${r.description || "N/A"}`).join("\n")}

Respond ONLY with a valid JSON array of objects. Do not include markdown formatting like \`\`\`json.
Schema:
[
  {
    "id": "resource_id",
    "score": 9.5,
    "explanation": "Why this resource is helpful"
  }
]
`;
        try {
            const aiResponse = await gateway_1.default.generate(prompt);
            const parsed = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
            if (Array.isArray(parsed)) {
                const explanationsMap = new Map();
                parsed.forEach((item) => {
                    explanationsMap.set(item.id, {
                        score: item.score,
                        explanation: item.explanation,
                    });
                });
                // Add AI details and sort by new score
                const aiRanked = topResults.map((item) => {
                    const aiData = explanationsMap.get(item.id);
                    return {
                        ...item,
                        metadata: {
                            ...item.metadata,
                            aiExplanation: aiData?.explanation || "Recommended based on query context.",
                            aiScore: aiData?.score || 8.0,
                        },
                    };
                });
                // Sort DESC by AI score
                aiRanked.sort((a, b) => b.metadata.aiScore - a.metadata.aiScore);
                // Append remaining items that weren't inside the top 10 re-ranking
                const rest = results.slice(10);
                return [...aiRanked, ...rest];
            }
        }
        catch (err) {
            console.error("AI re-ranking failed:", err.message);
        }
        return results;
    }
    /**
     * Log search query to search_history table
     */
    static async saveSearchHistory(userId, query, providers) {
        await supabase_1.supabase.from("search_history").insert({
            user_id: userId,
            query,
            providers,
        });
    }
    /**
     * Save content records to database
     */
    static async persistContent(items) {
        for (const item of items) {
            const dbRecord = {
                id: item.id,
                title: item.title,
                url: item.url,
                source: item.source,
                type: item.type,
                thumbnail: item.thumbnail,
                description: item.description,
                author: item.author,
                duration: item.duration,
                view_count: item.viewCount || 0,
                tags: item.tags,
                language: item.language,
                metadata: item.metadata,
            };
            await supabase_1.supabase.from("content").upsert(dbRecord, { onConflict: "url" });
        }
    }
    /**
     * Simple heuristic ranking by relevance, popularity, and source weight
     */
    static rankResults(items, query) {
        const q = query.toLowerCase();
        return items
            .map((item) => {
            let score = 0;
            // Keyword matches in title
            if (item.title.toLowerCase().includes(q))
                score += 50;
            // Keyword matches in description
            if (item.description?.toLowerCase().includes(q))
                score += 20;
            // Platform popularity factors
            if (item.source === "github" && item.viewCount) {
                // GitHub Stars
                score += Math.min(item.viewCount / 500, 30);
            }
            else if (item.source === "youtube" && item.viewCount) {
                // YouTube Views
                score += Math.min(item.viewCount / 10000, 30);
            }
            else if (item.source === "reddit" && item.viewCount) {
                // Reddit Upvotes
                score += Math.min(item.viewCount / 50, 30);
            }
            // Add small random score to avoid identical ranks
            score += Math.random() * 2;
            return { item, score };
        })
            .sort((a, b) => b.score - a.score)
            .map((x) => x.item);
    }
    /**
     * Fetch search history for a user
     */
    static async getHistory(userId) {
        if (!isSupabaseConfigured()) {
            return []; // No DB, return empty history
        }
        const { data, error } = await supabase_1.supabase
            .from("search_history")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20);
        if (error)
            throw error;
        return data;
    }
}
exports.SearchService = SearchService;
exports.default = SearchService;
//# sourceMappingURL=search.service.js.map