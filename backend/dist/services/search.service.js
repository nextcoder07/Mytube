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
        console.debug("[SearchService.search] user=", userId, "query=", query, "providers=", providers, "options=", options);
        // 1. Fetch raw content from providers in parallel
        const rawResults = await providers_1.default.searchSelected(providers, query, options);
        console.debug("[SearchService.search] raw results fetched count=", rawResults.length);
        // 2. Deduplicate by URL
        const uniqueMap = new Map();
        rawResults.forEach((item) => {
            if (!uniqueMap.has(item.url)) {
                uniqueMap.set(item.url, item);
            }
        });
        const deduplicated = Array.from(uniqueMap.values());
        console.debug("[SearchService.search] deduplicated count=", deduplicated.length);
        // 3. Rank results
        const ranked = this.rankResults(deduplicated, query);
        // 4. Save search history & save new content records in DB asynchronously
        //    Only attempt if Supabase is properly configured
        if (isSupabaseConfigured()) {
            this.saveSearchHistory(userId, query, providers).catch((err) => console.error("Failed to save search history:", err.message));
            this.persistContent(ranked).catch((err) => console.error("Failed to persist content:", err.message));
        }
        const limit = options?.limit || 100;
        const sliced = ranked.slice(0, limit);
        if ((sliced || []).length === 0) {
            console.warn(`[SearchService.search] No results after ranking for query="${query}" with providers=${providers.join(",")}`);
        }
        return sliced;
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
        // Build personalization context if the user provided additional instructions
        const personalizationBlock = options?.aiContext
            ? `\nThe user provided the following personalization context for their search:\n"${options.aiContext}"\nUse this context to better rank results and tailor your explanations to their specific needs, level, and preferences.\n`
            : '';
        const prompt = `
You are an expert tutor. Re-rank these content learning resources for the query: "${query}".
${personalizationBlock}
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
    static decodeHtmlEntities(str) {
        return str
            .replace(/&amp;/g, "&")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&apos;/g, "'");
    }
    static normalizeText(text) {
        let clean = this.decodeHtmlEntities(text).toLowerCase();
        clean = clean.replace(/[’’ISO\u2019\u2018\u201b\u00b4`]/g, "'");
        clean = clean.replace(/[“”]/g, '"');
        clean = clean.replace(/[-_]/g, " ");
        clean = clean.replace(/[^a-z0-9\s'"]/g, " ");
        return clean.replace(/\s+/g, " ").trim();
    }
    static extractSeasonAndEpisode(text) {
        let season = null;
        let episode = null;
        let current = this.decodeHtmlEntities(text).toLowerCase();
        // Match patterns like s02e02, s2e2, s02ep02, s2ep2
        const sxeMatch = current.match(/\bs(\d+)\s*(?:e|ep)\s*(\d+)\b/);
        if (sxeMatch) {
            season = parseInt(sxeMatch[1], 10);
            episode = parseInt(sxeMatch[2], 10);
            current = current.replace(sxeMatch[0], " ");
        }
        else {
            // Match season patterns
            const seasonMatch = current.match(/\b(?:season|s)\s*[-_]?\s*(\d+)\b/);
            if (seasonMatch) {
                season = parseInt(seasonMatch[1], 10);
                current = current.replace(seasonMatch[0], " ");
            }
            // Match episode patterns
            const epMatch = current.match(/\b(?:episode|ep|e)\s*[-_]?\s*(\d+)\b/);
            if (epMatch) {
                episode = parseInt(epMatch[1], 10);
                current = current.replace(epMatch[0], " ");
            }
        }
        return {
            season,
            episode,
            cleanText: current.trim()
        };
    }
    static matchToken(token, text) {
        if (text.includes(token))
            return true;
        if (token.endsWith("s") && text.includes(token.slice(0, -1)))
            return true;
        if (!token.endsWith("s") && text.includes(token + "s"))
            return true;
        if (token.endsWith("'s") && text.includes(token.slice(0, -2)))
            return true;
        return false;
    }
    static rankResults(items, query) {
        const querySE = this.extractSeasonAndEpisode(query);
        const normalizedCleanQuery = this.normalizeText(querySE.cleanText);
        // Extract tokens from the query: allow length >= 1 if it's a number, otherwise length >= 2
        const queryTokens = normalizedCleanQuery
            .split(/\s+/)
            .filter(token => token.length >= 2 || /^\d+$/.test(token));
        return items
            .map((item, index) => {
            let score = 0;
            const normalizedTitle = this.normalizeText(item.title);
            const normalizedDesc = this.normalizeText(item.description || "");
            // 1. Season/Episode Matching (if specified in query)
            const titleSE = this.extractSeasonAndEpisode(item.title);
            // Season check
            if (querySE.season !== null) {
                if (titleSE.season !== null) {
                    if (querySE.season === titleSE.season) {
                        score += 100;
                    }
                    else {
                        // Mild penalty for mismatching season, not filtering it out
                        score -= 50;
                    }
                }
                else {
                    score -= 10;
                }
            }
            // Episode check
            if (querySE.episode !== null) {
                if (titleSE.episode !== null) {
                    if (querySE.episode === titleSE.episode) {
                        score += 150;
                    }
                    else {
                        // Mild penalty for mismatching episode
                        score -= 50;
                    }
                }
                else {
                    score -= 10;
                }
            }
            // 2. Exact Phrase Boost
            if (normalizedTitle.includes(normalizedCleanQuery)) {
                score += 150;
            }
            // 3. Keyword Token Coverage Boost
            let titleTokenMatches = 0;
            queryTokens.forEach(token => {
                if (this.matchToken(token, normalizedTitle)) {
                    titleTokenMatches++;
                }
            });
            const coverageRatio = queryTokens.length > 0 ? titleTokenMatches / queryTokens.length : 0;
            score += coverageRatio * 100;
            if (coverageRatio === 1.0) {
                score += 50; // Extra bonus for matching all query tokens
            }
            // 4. Original list index weight (preserves API rank as tie-breaker)
            // Since we fetch up to 100 items per provider, scale this boost to 100
            const indexBoost = Math.max(0, 100 - index);
            score += indexBoost;
            // 5. Popularity bonus (small contribution to keep it query-first)
            if (item.source === "github" && item.viewCount) {
                score += Math.min(item.viewCount / 1000, 15);
            }
            else if (item.source === "youtube" && item.viewCount) {
                score += Math.min(item.viewCount / 200000, 15);
            }
            else if (item.source === "reddit" && item.viewCount) {
                score += Math.min(item.viewCount / 100, 15);
            }
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