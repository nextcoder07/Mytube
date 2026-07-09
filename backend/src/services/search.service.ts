// src/services/search.service.ts
import providerManager from "../providers";
import { Content, SearchOptions } from "../models/content.model";
import { supabase } from "../utils/supabase";
import AIGateway from "../ai/gateway";
import config from "../config/index";

/** Check if Supabase is actually configured (not placeholder values) */
function isSupabaseConfigured(): boolean {
  return (
    !!config.supabaseUrl &&
    !config.supabaseUrl.includes("your-supabase") &&
    !!config.supabaseServiceKey &&
    !config.supabaseServiceKey.includes("your-supabase")
  );
}

export class SearchService {
  /**
   * Search providers, deduplicate, rank, save results, and log search history.
   */
  static async search(
    userId: string,
    query: string,
    options?: SearchOptions
  ): Promise<Content[]> {
    const providers = options?.providers || ["youtube", "devto", "github", "reddit", "medium", "wikipedia", "website"];
    console.debug("[SearchService.search] user=", userId, "query=", query, "providers=", providers, "options=", options);

    const targetLimit = options?.limit || 100;
    // Request a larger pool of results from providers to rank and filter effectively
    const providerOptions = {
      ...options,
      limit: Math.max(targetLimit * 2, 200)
    };

    // 1. Fetch raw content from providers in parallel
    const rawResults = await providerManager.searchSelected(providers, query, providerOptions);
    console.debug("[SearchService.search] raw results fetched count=", rawResults.length);

    // 2. Deduplicate by URL
    const uniqueMap = new Map<string, Content>();
    rawResults.forEach((item) => {
      if (!uniqueMap.has(item.url)) {
        uniqueMap.set(item.url, item);
      }
    });
    const deduplicated = Array.from(uniqueMap.values());
    console.debug("[SearchService.search] deduplicated count=", deduplicated.length);

    // 3. Rank results
    const ranked = this.rankResults(deduplicated, query, options?.aiContext);

    // 4. Save search history & save new content records in DB asynchronously
    //    Only attempt if Supabase is properly configured
    if (isSupabaseConfigured()) {
      this.saveSearchHistory(userId, query, providers).catch((err) =>
        console.error("Failed to save search history:", err.message)
      );
      this.persistContent(ranked).catch((err) =>
        console.error("Failed to persist content:", err.message)
      );
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
  static async searchAI(
    userId: string,
    query: string,
    options?: SearchOptions
  ): Promise<Content[]> {
    const results = await this.search(userId, query, options);
    if (results.length === 0) return [];

    // Check if AI is configured
    const aiConfigured =
      (config.aiProvider === "gemini" && config.geminiApiKey && !config.geminiApiKey.includes("your-")) ||
      (config.aiProvider === "openrouter" && config.openrouterApiKey && !config.openrouterApiKey.includes("your-"));

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
      const aiResponse = await AIGateway.generate(prompt);
      const parsed = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());

      if (Array.isArray(parsed)) {
        const explanationsMap = new Map<string, { score: number; explanation: string }>();
        parsed.forEach((item: any) => {
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
        aiRanked.sort((a, b) => (b.metadata.aiScore as number) - (a.metadata.aiScore as number));
        
        // Append remaining items that weren't inside the top 10 re-ranking
        const rest = results.slice(10);
        return [...aiRanked, ...rest];
      }
    } catch (err: any) {
      console.error("AI re-ranking failed:", err.message);
    }

    return results;
  }

  /**
   * Log search query to search_history table
   */
  private static async saveSearchHistory(userId: string, query: string, providers: string[]) {
    await supabase.from("search_history").insert({
      user_id: userId,
      query,
      providers,
    });
  }

  /**
   * Save content records to database
   */
  private static async persistContent(items: Content[]) {
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

      await supabase.from("content").upsert(dbRecord, { onConflict: "url" });
    }
  }

  private static decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&apos;/g, "'");
  }

  private static normalizeText(text: string): string {
    let clean = this.decodeHtmlEntities(text).toLowerCase();
    clean = clean.replace(/[’’ISO\u2019\u2018\u201b\u00b4`]/g, "'");
    clean = clean.replace(/[“”]/g, '"');
    clean = clean.replace(/[-_]/g, " ");
    clean = clean.replace(/[^a-z0-9\s'"]/g, " ");
    return clean.replace(/\s+/g, " ").trim();
  }

  private static extractSeasonAndEpisode(text: string): { season: number | null; episode: number | null; cleanText: string } {
    let season: number | null = null;
    let episode: number | null = null;

    let current = this.decodeHtmlEntities(text).toLowerCase();

    // Match patterns like s02e02, s2e2, s02ep02, s2ep2
    const sxeMatch = current.match(/\bs(\d+)\s*(?:e|ep)\s*(\d+)\b/);
    if (sxeMatch) {
      season = parseInt(sxeMatch[1], 10);
      episode = parseInt(sxeMatch[2], 10);
      current = current.replace(sxeMatch[0], " ");
    } else {
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

  private static escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  private static matchToken(token: string, text: string): boolean {
    // Exact word boundary match ignoring case.
    const escaped = this.escapeRegExp(token);
    // Allow plural/possessive variants gracefully with boundaries
    const pattern = new RegExp(`\\b${escaped}(?:s|'s)?\\b`, 'i');
    return pattern.test(text);
  }

  private static rankResults(items: Content[], query: string, aiContext?: string): Content[] {
    const querySE = this.extractSeasonAndEpisode(query);
    const normalizedCleanQuery = this.normalizeText(querySE.cleanText);
    
    const queryTokens = normalizedCleanQuery
      .split(/\s+/)
      .filter(token => token.length >= 2 || /^\d+$/.test(token));

    const contextTokens = aiContext 
      ? this.normalizeText(aiContext).split(/\s+/).filter(token => token.length >= 3)
      : [];

    return items
      .map((item) => {
        let score = 0;
        const normalizedTitle = this.normalizeText(item.title);
        const normalizedDesc = this.normalizeText(item.description || "");
        const allText = `${normalizedTitle} ${normalizedDesc} ${item.tags.join(" ")}`.toLowerCase();

        // 1. Exact query match in title (Highest boost)
        if (normalizedTitle.includes(normalizedCleanQuery)) {
          score += 200;
        } else if (allText.includes(normalizedCleanQuery)) {
          score += 100;
        }

        // 2. Query token coverage
        let tokenMatches = 0;
        queryTokens.forEach(token => {
          if (this.matchToken(token, allText)) tokenMatches++;
        });
        if (queryTokens.length > 0) {
          score += (tokenMatches / queryTokens.length) * 100;
        }

        // 3. Goal/Context semantic relevance
        if (contextTokens.length > 0) {
          let contextMatches = 0;
          contextTokens.forEach(token => {
            if (this.matchToken(token, allText)) contextMatches++;
          });
          score += (contextMatches / contextTokens.length) * 150;
        }

        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
  }

  /**
   * Fetch search history for a user
   */
  static async getHistory(userId: string) {
    if (!isSupabaseConfigured()) {
      return []; // No DB, return empty history
    }

    const { data, error } = await supabase
      .from("search_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  }
}

export default SearchService;
