// src/services/search.service.ts
import providerManager from "../providers";
import { Content, SearchOptions } from "../models/content.model";
import { searchCache } from "../cache/search-cache";
import { supabase } from "../utils/supabase";
import AIGateway from "../ai/gateway";
import config from "../config/index";
import { QueryAnalyzer, QueryType } from "../utils/queryAnalyzer";

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
    // Use ALL providers by default for maximum results diversity
    const providers = options?.providers || ["youtube", "github", "reddit", "medium", "website", "devto", "wikipedia"];
    console.debug("[SearchService.search] user=", userId, "query=", query, "providers=", providers, "options=", options);

    const page = options?.page && options.page > 0 ? options.page : 1;
    const visibleLimit = options?.limit || 70;
    const batchSize = searchCache.getBatchSize();
    const fetchBatchSize = searchCache.getFetchSize();
    const startIndex = (page - 1) * visibleLimit;
    const endIndex = page * visibleLimit;
    const targetCacheSize = Math.max(endIndex, fetchBatchSize, visibleLimit + batchSize);

    if (options?.useCache === false) {
      searchCache.clear(query);
    }

    const providerPromises = providers.map(async (source) => {
      const cachedItems = options?.useCache === false ? [] : searchCache.getAll(query, source);
      const cachedLength = cachedItems?.length ?? 0;

      if (cachedItems && cachedLength > targetCacheSize) {
        searchCache.trim(query, targetCacheSize, source);
      }

      const needsFetch = cachedLength < targetCacheSize;
      if (needsFetch) {
        const currentCached = cachedItems ?? [];
        const additionalFetch = currentCached.length === 0
          ? fetchBatchSize
          : Math.max(batchSize, targetCacheSize - currentCached.length);

        const providerResults = await providerManager.searchProvider(source, query, {
          ...options,
          providers: [source],
          limit: additionalFetch,
        });

        const combinedResults = [...currentCached, ...providerResults];
        const sortedResults = this.rankResults(combinedResults, query);
        searchCache.set(query, sortedResults, source);
      }

      return searchCache.getAll(query, source) || [];
    });

    const sourceResultsArray = await Promise.all(providerPromises);
    const rawResults = sourceResultsArray.flat();
    console.debug("[SearchService.search] raw results fetched count=", rawResults.length);

    // Log breakdown by source for debugging
    const bySource: Record<string, number> = {};
    rawResults.forEach(r => {
      bySource[r.source] = (bySource[r.source] || 0) + 1;
    });
    console.debug("[SearchService.search] breakdown by source:", bySource);

    // 2. Deduplicate by URL
    const uniqueMap = new Map<string, Content>();
    rawResults.forEach((item) => {
      if (!uniqueMap.has(item.url)) {
        uniqueMap.set(item.url, item);
      }
    });
    const deduplicated = Array.from(uniqueMap.values());
    console.debug("[SearchService.search] deduplicated count=", deduplicated.length);

    // 3. Sort deduplicated results using relevance and goal alignment.
    const shouldPreserveProviderOrder = false;

    let goal: any = null;
    if (options?.goalId && userId !== "anonymous" && isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from("goals")
          .select("*")
          .eq("id", options.goalId)
          .eq("user_id", userId)
          .single();
        if (data) {
          goal = data;
        }
      } catch (err: any) {
        console.error("Failed to fetch goal for ranking:", err.message);
      }
    }

    const ranked = shouldPreserveProviderOrder
      ? deduplicated
      : this.rankResults(deduplicated, query, goal);

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

    const filtered = options?.excludeIds && options.excludeIds.length > 0
      ? ranked.filter((item) => !options.excludeIds?.includes(item.id))
      : ranked;

    const sliced = options?.limit
      ? filtered.slice(startIndex, endIndex)
      : filtered.slice(startIndex, endIndex);

    if ((sliced || []).length === 0) {
      console.warn(`[SearchService.search] No results after ranking for query="${query}" with providers=${providers.join(",")} excludeIds=${options?.excludeIds?.length || 0}`);
    }
    return sliced;
  }

  /**
   * AI-enhanced search with smart query analysis.
   * Detects specialized queries (GitHub users, YouTube channels, etc.)
   * and applies intelligent provider selection and re-ranking.
   */
  static async searchAI(
    userId: string,
    query: string,
    options?: SearchOptions
  ): Promise<Content[]> {
    // 1. Analyze the query to detect specialized patterns
    const queryAnalysis = QueryAnalyzer.analyze(query);
    console.debug(
      `[SearchService.searchAI] Query type: ${queryAnalysis.type}, Specialized: ${queryAnalysis.isSpecialized}`,
      `Original: "${queryAnalysis.originalQuery}" → Enhanced: "${queryAnalysis.enhancedQuery}"`
    );

    // 2. Determine providers based on query analysis
    // For generic queries, always use ALL providers for maximum diversity
    let effectiveProviders = options?.providers;
    if (!effectiveProviders || effectiveProviders.length === 0) {
      if (queryAnalysis.isSpecialized) {
        // Use specialized providers for specialized queries
        effectiveProviders = queryAnalysis.suggestedProviders;
        console.debug(`[SearchService.searchAI] Using specialized providers: ${effectiveProviders.join(",")}`);
      } else {
        // Use ALL providers for generic queries
        effectiveProviders = ["youtube", "github", "reddit", "medium", "website", "devto", "wikipedia"];
        console.debug(`[SearchService.searchAI] Using all providers for generic query`);
      }
    }

    // 3. Use enhanced query for specialized searches
    const searchQuery = queryAnalysis.isSpecialized 
      ? queryAnalysis.enhancedQuery 
      : query;

    // 4. Perform search with optimized parameters
    const results = await this.search(userId, searchQuery, {
      ...options,
      providers: effectiveProviders,
    });

    if (results.length === 0) {
      console.warn(`[SearchService.searchAI] No results for query: "${query}"`);
      return [];
    }

    // Check if AI is configured
    const aiConfigured =
      (config.aiProvider === "gemini" && config.geminiApiKey && !config.geminiApiKey.includes("your-")) ||
      (config.aiProvider === "openrouter" && config.openrouterApiKey && !config.openrouterApiKey.includes("your-"));

    if (!aiConfigured) {
      console.warn("⚠️ AI provider not configured. Returning results without AI re-ranking.");
      return results;
    }

    // 5. Send top results to AI for re-ranking and personalization explanation
    const topResults = results.slice(0, 10);

    // Build personalization context
    const personalizationBlock = options?.aiContext
      ? `\nThe user provided the following personalization context for their search:\n"${options.aiContext}"\nUse this context to better rank results and tailor your explanations to their specific needs, level, and preferences.\n`
      : '';

    // Add specialized query guidance if applicable
    const specializedGuidance = this.getSpecializedSearchGuidance(queryAnalysis);
    const queryContext = specializedGuidance 
      ? `\nNote: The user is looking for: ${specializedGuidance}\n`
      : '';

    const prompt = `
You are an expert tutor and content curator. Re-rank these content learning resources for the query: "${queryAnalysis.originalQuery}".
${queryContext}
${personalizationBlock}
For each resource, explain in 1-2 sentences WHY it is highly relevant for the user's search, and give a score from 1-10.
Prioritize accuracy of results for the specific query pattern (e.g., for GitHub users, prioritize their actual profiles/repos; for YouTube channels, prioritize verified channels).

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
              queryType: queryAnalysis.type,
              isSpecializedResult: queryAnalysis.isSpecialized,
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

  private static matchToken(token: string, text: string): boolean {
    if (text.includes(token)) return true;
    if (token.endsWith("s") && text.includes(token.slice(0, -1))) return true;
    if (!token.endsWith("s") && text.includes(token + "s")) return true;
    if (token.endsWith("'s") && text.includes(token.slice(0, -2))) return true;
    return false;
  }

  /**
   * Generate specialized guidance for AI re-ranking based on query type
   */
  private static getSpecializedSearchGuidance(queryAnalysis: any): string {
    switch (queryAnalysis.type) {
      case "github_user":
        return `a specific GitHub user profile (${queryAnalysis.metadata?.username}), including their repositories, contributions, and public projects`;
      case "github_repo":
        return `relevant GitHub repositories matching the criteria, with emphasis on starred/popular repos and those with good documentation`;
      case "youtube_channel":
        return `a specific YouTube channel (@${queryAnalysis.metadata?.channelHandle}), including its videos, playlists, and channel information`;
      case "youtube_video":
        return `YouTube videos matching the search query, with preference for tutorial-style or comprehensive content`;
      case "twitter_profile":
        return `a specific Twitter/X profile (${queryAnalysis.metadata?.username}), including tweets, threads, and profile information`;
      default:
        return "";
    }
  }

  /**
   * Improved ranking system with semantic understanding and provider balance
   * Focuses on relevance, context, and diversity instead of bare text matching
   */
  private static rankResults(items: Content[], query: string, goal?: any): Content[] {
    const normalizedQuery = this.normalizeText(query).toLowerCase();
    const queryTokens = normalizedQuery
      .split(/\s+/)
      .filter(token => token.length >= 2 || /^\d+$/.test(token));

    // Score each item
    const scored = items.map((item, index) => {
      let score = 0;
      const normalizedTitle = this.normalizeText(item.title).toLowerCase();
      const normalizedDesc = this.normalizeText(item.description || "").toLowerCase();
      const normalizedTags = (item.tags || []).map(t => t.toLowerCase());

      // ===== SEMANTIC RELEVANCE (Primary) =====
      
      // 1. Title relevance - stronger weight
      const titleRelevance = this.calculateSemanticRelevance(normalizedQuery, normalizedTitle);
      score += titleRelevance * 80;

      // 2. Description relevance - moderate weight
      const descRelevance = this.calculateSemanticRelevance(normalizedQuery, normalizedDesc);
      score += descRelevance * 40;

      // 3. Tags/keywords relevance - lower weight
      const tagsRelevance = Math.max(0, ...normalizedTags.map(tag => 
        this.calculateSemanticRelevance(normalizedQuery, tag)
      ));
      score += tagsRelevance * 20;

      // ===== CONTENT TYPE BONUS (Secondary) =====
      // Different content types are valuable - don't penalize variety
      const typeBonus = this.getContentTypeBonus(item.type, query);
      score += typeBonus;

      // ===== POPULARITY SIGNAL (Tertiary - small contribution) =====
      // Higher view counts suggest quality, but don't dominate
      if (item.viewCount) {
        const viewBonus = Math.min(Math.log(item.viewCount) * 5, 15);
        score += viewBonus;
      }

      // ===== PROVIDER DIVERSITY BONUS (Secondary) =====
      // Ensure variety: boost underrepresented sources slightly
      const sourceBonus = this.getSourceDiversityBonus(item.source, items);
      score += sourceBonus;

      // ===== GOAL ALIGNMENT (if applicable) =====
      if (goal) {
        const goalRelevance = this.calculateSemanticRelevance(
          this.normalizeText(goal.title).toLowerCase(),
          normalizedTitle + " " + normalizedDesc
        );
        score += goalRelevance * 30;
      }

      // ===== ORIGINAL RANKING AS TIE-BREAKER =====
      // API returns in order of relevance - use as tie-breaker only
      score += Math.max(0, 5 - index * 0.1);

      return { item, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Return with diversity: spread providers throughout results
    return this.balanceProviderDiversity(scored.map(s => s.item));
  }

  /**
   * Calculate semantic relevance between query and text
   * Returns 0-1 score
   */
  private static calculateSemanticRelevance(query: string, text: string): number {
    if (!query || !text) return 0;

    const queryTokens = query.split(/\s+/).filter(t => t.length >= 2);
    const textTokens = text.split(/\s+/).filter(t => t.length >= 2);

    if (queryTokens.length === 0 || textTokens.length === 0) return 0;

    // Count matching tokens
    let matches = 0;
    queryTokens.forEach(qt => {
      textTokens.forEach(tt => {
        // Exact match
        if (qt === tt) {
          matches += 1.0;
        } 
        // Partial match (prefix/suffix)
        else if (tt.includes(qt) || qt.includes(tt)) {
          matches += 0.6;
        }
        // Similar (edit distance-like)
        else if (this.levenshteinDistance(qt, tt) <= 2) {
          matches += 0.3;
        }
      });
    });

    // Normalize to 0-1
    const maxPossibleMatches = queryTokens.length;
    return Math.min(matches / maxPossibleMatches, 1.0);
  }

  /**
   * Simple Levenshtein distance for fuzzy matching
   */
  private static levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Get bonus score for content type based on query context
   */
  private static getContentTypeBonus(type: string, query: string): number {
    const q = query.toLowerCase();

    // Video queries benefit from video content
    if ((q.includes("video") || q.includes("tutorial") || q.includes("how")) && 
        (type === "video" || type === "channel")) {
      return 15;
    }

    // Code queries benefit from repos
    if ((q.includes("code") || q.includes("repo") || q.includes("project")) && 
        (type === "repo" || type === "profile")) {
      return 15;
    }

    // Article/learning queries benefit from articles
    if ((q.includes("learn") || q.includes("guide") || q.includes("tutorial")) && 
        (type === "article" || type === "post")) {
      return 10;
    }

    // No penalty for any type - diversity is good
    return 5;
  }

  /**
   * Boost underrepresented sources to ensure diversity
   */
  private static getSourceDiversityBonus(source: string, allItems: Content[]): number {
    const sourceCounts = allItems.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const currentSourceCount = sourceCounts[source] || 1;
    const avgCount = allItems.length / Object.keys(sourceCounts).length;

    // If this source is underrepresented, boost it slightly
    if (currentSourceCount < avgCount) {
      return 8;
    }

    return 0;
  }

  /**
   * Balance provider diversity in final results
   * Ensures we show good content from all providers, not dominated by one
   */
  private static balanceProviderDiversity(items: Content[]): Content[] {
    if (items.length <= 10) return items;

    // For small result sets, return as-is
    // For large sets, interleave providers

    const bySource: Record<string, Content[]> = {};
    items.forEach(item => {
      if (!bySource[item.source]) bySource[item.source] = [];
      bySource[item.source].push(item);
    });

    // If we have only one source, return as-is
    const sources = Object.keys(bySource);
    if (sources.length <= 1) return items;

    // Interleave: take one from each source in round-robin fashion
    const balanced: Content[] = [];
    let maxLength = Math.max(...sources.map(s => bySource[s].length));

    for (let i = 0; i < maxLength; i++) {
      sources.forEach(source => {
        if (bySource[source][i]) {
          balanced.push(bySource[source][i]);
        }
      });
    }

    return balanced;
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
