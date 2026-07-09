/**
 * Smart Query Analyzer
 * Detects specialized query patterns (GitHub users, YouTube channels, etc.)
 * and suggests optimal providers and enhanced search strategies
 */

export enum QueryType {
  GITHUB_USER = "github_user",
  GITHUB_REPO = "github_repo",
  YOUTUBE_CHANNEL = "youtube_channel",
  YOUTUBE_VIDEO = "youtube_video",
  TWITTER_PROFILE = "twitter_profile",
  GENERIC = "generic",
}

export interface QueryAnalysis {
  type: QueryType;
  originalQuery: string;
  enhancedQuery: string;
  suggestedProviders: string[];
  isSpecialized: boolean;
  metadata?: {
    userId?: string;
    channelHandle?: string;
    username?: string;
    query?: string;
  };
}

export class QueryAnalyzer {
  /**
   * Analyze a query and determine its type and optimal search strategy
   */
  static analyze(query: string): QueryAnalysis {
    const trimmed = query.trim();

    // GitHub user page: @username or github.com/username
    if (this.isGitHubUser(trimmed)) {
      const username = this.extractGitHubUsername(trimmed);
      return {
        type: QueryType.GITHUB_USER,
        originalQuery: query,
        enhancedQuery: username,
        suggestedProviders: ["github"],
        isSpecialized: true,
        metadata: {
          username,
        },
      };
    }

    // YouTube channel: @channelname or youtube.com/@channelname
    if (this.isYouTubeChannel(trimmed)) {
      const channelHandle = this.extractYouTubeChannelHandle(trimmed);
      return {
        type: QueryType.YOUTUBE_CHANNEL,
        originalQuery: query,
        enhancedQuery: `channel "${channelHandle}"`,
        suggestedProviders: ["youtube"],
        isSpecialized: true,
        metadata: {
          channelHandle,
        },
      };
    }

    // Twitter/X profile: @username or twitter.com/username
    if (this.isTwitterProfile(trimmed)) {
      const username = this.extractTwitterUsername(trimmed);
      return {
        type: QueryType.TWITTER_PROFILE,
        originalQuery: query,
        enhancedQuery: username,
        suggestedProviders: ["twitter", "website"],
        isSpecialized: true,
        metadata: {
          username,
        },
      };
    }

    // YouTube video search: contains "video" or "channel" keywords
    if (this.isYouTubeVideoSearch(trimmed)) {
      return {
        type: QueryType.YOUTUBE_VIDEO,
        originalQuery: query,
        enhancedQuery: `${query} site:youtube.com`,
        suggestedProviders: ["youtube"],
        isSpecialized: true,
      };
    }

    // GitHub repo search: contains "repo:" or specific patterns
    if (this.isGitHubRepoSearch(trimmed)) {
      return {
        type: QueryType.GITHUB_REPO,
        originalQuery: query,
        enhancedQuery: query,
        suggestedProviders: ["github", "website"],
        isSpecialized: true,
      };
    }

    // Generic search: use multiple providers with intelligent ranking
    return {
      type: QueryType.GENERIC,
      originalQuery: query,
      enhancedQuery: query,
      suggestedProviders: ["youtube", "github", "reddit", "medium", "website"],
      isSpecialized: false,
    };
  }

  /**
   * Check if query is a GitHub user profile
   */
  private static isGitHubUser(query: string): boolean {
    // Patterns: @username, github.com/username, user:username
    return (
      /^@[a-zA-Z0-9\-]+$/.test(query) || // @username
      /github\.com\/[a-zA-Z0-9\-]+\/?$/.test(query) || // github.com/username
      /^user:\s*[a-zA-Z0-9\-]+$/.test(query) || // user: username
      /github user|github profile|github\s+[a-z0-9\-]+\s+profile/i.test(query) // descriptive
    );
  }

  /**
   * Extract GitHub username from various formats
   */
  private static extractGitHubUsername(query: string): string {
    const atMatch = query.match(/^@([a-zA-Z0-9\-]+)/);
    if (atMatch) return atMatch[1];

    const urlMatch = query.match(/github\.com\/([a-zA-Z0-9\-]+)/);
    if (urlMatch) return urlMatch[1];

    const userMatch = query.match(/user:\s*([a-zA-Z0-9\-]+)/i);
    if (userMatch) return userMatch[1];

    // For descriptive queries, extract username if present
    const profileMatch = query.match(/github\s+([a-z0-9\-]+)\s+profile/i);
    if (profileMatch) return profileMatch[1];

    return query.replace(/[@\s]/g, "").substring(0, 20);
  }

  /**
   * Check if query is a YouTube channel
   */
  private static isYouTubeChannel(query: string): boolean {
    return (
      /^@[a-zA-Z0-9_]+$/.test(query) && query.length > 3 ||
      /youtube\.com\/@[a-zA-Z0-9_]+\/?$/.test(query) ||
      /youtube\s+channel|yt\s+channel|channel\s+@/i.test(query)
    );
  }

  /**
   * Extract YouTube channel handle
   */
  private static extractYouTubeChannelHandle(query: string): string {
    const atMatch = query.match(/^@([a-zA-Z0-9_]+)/);
    if (atMatch) return atMatch[1];

    const urlMatch = query.match(/youtube\.com\/@([a-zA-Z0-9_]+)/);
    if (urlMatch) return urlMatch[1];

    const descMatch = query.match(/channel\s+@?([a-zA-Z0-9_]+)/i);
    if (descMatch) return descMatch[1];

    return query.replace(/[@\s]/g, "").substring(0, 20);
  }

  /**
   * Check if query is a Twitter profile
   */
  private static isTwitterProfile(query: string): boolean {
    return (
      /^@[a-zA-Z0-9_]{1,15}$/.test(query) && query.includes("twitter") === false ||
      /twitter\.com\/[a-zA-Z0-9_]+\/?$/.test(query) ||
      /x\.com\/[a-zA-Z0-9_]+\/?$/.test(query) ||
      /twitter profile|twitter user|@[a-z0-9_]+ twitter/i.test(query)
    );
  }

  /**
   * Extract Twitter username
   */
  private static extractTwitterUsername(query: string): string {
    const atMatch = query.match(/^@([a-zA-Z0-9_]{1,15})/);
    if (atMatch) return atMatch[1];

    const urlMatch = query.match(/(twitter|x)\.com\/([a-zA-Z0-9_]+)/);
    if (urlMatch) return urlMatch[2];

    return query.replace(/[@\s]/g, "").substring(0, 15);
  }

  /**
   * Check if query is a YouTube video search
   */
  private static isYouTubeVideoSearch(query: string): boolean {
    return (
      /youtube|yt\s+video|video\s+tutorial|watch\s+video|channel\s+videos/i.test(query) ||
      /site:youtube\.com/i.test(query)
    );
  }

  /**
   * Check if query is a GitHub repo search
   */
  private static isGitHubRepoSearch(query: string): boolean {
    return (
      /repo:|repository|github.*repo|awesome.*list/i.test(query) ||
      /site:github\.com/i.test(query)
    );
  }

  /**
   * Build optimized search string for specialized queries
   */
  static buildOptimizedQuery(analysis: QueryAnalysis): string {
    switch (analysis.type) {
      case QueryType.GITHUB_USER:
        return `${analysis.metadata?.username} github profile repositories`;
      case QueryType.YOUTUBE_CHANNEL:
        return `channel ${analysis.metadata?.channelHandle} youtube videos`;
      case QueryType.TWITTER_PROFILE:
        return `${analysis.metadata?.username} twitter profile`;
      case QueryType.YOUTUBE_VIDEO:
        return analysis.enhancedQuery;
      case QueryType.GITHUB_REPO:
        return analysis.enhancedQuery;
      default:
        return analysis.enhancedQuery;
    }
  }

  /**
   * Suggest additional search terms based on query type
   */
  static getSuggestedSearchTerms(analysis: QueryAnalysis): string[] {
    const terms: string[] = [];

    switch (analysis.type) {
      case QueryType.GITHUB_USER:
        terms.push(
          `${analysis.metadata?.username} repositories`,
          `${analysis.metadata?.username} projects`,
          `${analysis.metadata?.username} github contributions`,
          `github user ${analysis.metadata?.username}`
        );
        break;
      case QueryType.YOUTUBE_CHANNEL:
        terms.push(
          `${analysis.metadata?.channelHandle} videos`,
          `youtube @${analysis.metadata?.channelHandle}`,
          `${analysis.metadata?.channelHandle} playlist`,
          `${analysis.metadata?.channelHandle} uploads`
        );
        break;
      case QueryType.YOUTUBE_VIDEO:
        terms.push(
          `${analysis.originalQuery} tutorial`,
          `${analysis.originalQuery} full course`,
          `${analysis.originalQuery} playlist`
        );
        break;
      default:
        break;
    }

    return terms;
  }
}
