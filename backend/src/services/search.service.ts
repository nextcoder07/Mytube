// src/services/search.service.ts
import providerManager from "../providers";
import { Content, SearchOptions } from "../models/content.model";
import { supabase } from "../utils/supabase";
import AIGateway from "../ai/gateway";

export class SearchService {
  /**
   * Search providers, deduplicate, rank, save results, and log search history.
   */
  static async search(
    userId: string,
    query: string,
    options?: SearchOptions
  ): Promise<Content[]> {
    const providers = options?.providers || ["youtube", "github", "reddit", "medium", "website"];
    
    // 1. Fetch raw content from providers in parallel
    const rawResults = await providerManager.searchSelected(providers, query, options);

    // 2. Deduplicate by URL
    const uniqueMap = new Map<string, Content>();
    rawResults.forEach((item) => {
      if (!uniqueMap.has(item.url)) {
        uniqueMap.set(item.url, item);
      }
    });
    const deduplicated = Array.from(uniqueMap.values());

    // 3. Rank results
    const ranked = this.rankResults(deduplicated, query);

    // 4. Save search history & save new content records in DB asynchronously
    this.saveSearchHistory(userId, query, providers).catch((err) =>
      console.error("Failed to save search history:", err.message)
    );
    this.persistContent(ranked).catch((err) =>
      console.error("Failed to persist content:", err.message)
    );

    return ranked;
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

  /**
   * Simple heuristic ranking by relevance, popularity, and source weight
   */
  private static rankResults(items: Content[], query: string): Content[] {
    const q = query.toLowerCase();

    return items
      .map((item) => {
        let score = 0;

        // Keyword matches in title
        if (item.title.toLowerCase().includes(q)) score += 50;
        
        // Keyword matches in description
        if (item.description?.toLowerCase().includes(q)) score += 20;

        // Platform popularity factors
        if (item.source === "github" && item.viewCount) {
          // GitHub Stars
          score += Math.min(item.viewCount / 500, 30);
        } else if (item.source === "youtube" && item.viewCount) {
          // YouTube Views
          score += Math.min(item.viewCount / 10000, 30);
        } else if (item.source === "reddit" && item.viewCount) {
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
  static async getHistory(userId: string) {
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
