// src/cache/search-cache.ts
import { Content } from "../models/content.model";

/**
 * In-memory cache for search results with optional Redis backend
 * Stores paginated batches of results organized by query + source
 */
export class SearchCache {
  private memoryCache = new Map<string, CachedSearchResult>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly BATCH_SIZE = 70; // Results to show per page
  private readonly FETCH_SIZE = 140; // Fetch 100-140 results per source for caching and ranking

  /**
   * Generate cache key from query and optional source
   */
  private getCacheKey(query: string, source?: string): string {
    const normalized = query.toLowerCase().trim();
    return source ? `${normalized}:${source}` : normalized;
  }

  /**
   * Store sorted results and batches
   */
  private dedupeByUrl(results: Content[]): Content[] {
    const map = new Map<string, Content>();
    results.forEach((item) => {
      if (!map.has(item.url)) {
        map.set(item.url, item);
      }
    });
    return Array.from(map.values());
  }

  private toBatches(results: Content[]): Content[][] {
    const batches: Content[][] = [];
    for (let i = 0; i < results.length; i += this.BATCH_SIZE) {
      batches.push(results.slice(i, i + this.BATCH_SIZE));
    }
    return batches;
  }

  set(query: string, results: Content[], source?: string): void {
    const key = this.getCacheKey(query, source);
    const unique = this.dedupeByUrl(results);
    const batches = this.toBatches(unique);

    this.memoryCache.set(key, {
      query,
      source: source || "combined",
      batches,
      totalResults: unique.length,
      createdAt: Date.now(),
      accessCount: 0,
    });
  }

  append(query: string, results: Content[], source?: string): void {
    const key = this.getCacheKey(query, source);
    const existing = this.getAll(query, source) || [];
    const combined = this.dedupeByUrl([...existing, ...results]);
    const batches = this.toBatches(combined);

    this.memoryCache.set(key, {
      query,
      source: source || "combined",
      batches,
      totalResults: combined.length,
      createdAt: Date.now(),
      accessCount: 0,
    });
  }

  /**
   * Get a specific page of results (0-indexed)
   */
  getPage(query: string, pageNum: number = 0, source?: string): Content[] | null {
    const key = this.getCacheKey(query, source);
    const cached = this.memoryCache.get(key);

    if (!cached) return null;

    // Check if cache expired
    if (Date.now() - cached.createdAt > this.CACHE_TTL) {
      this.memoryCache.delete(key);
      return null;
    }

    if (pageNum >= cached.batches.length) {
      return null;
    }

    // Update access count and timestamp
    cached.accessCount++;
    cached.createdAt = Date.now();

    return cached.batches[pageNum];
  }

  /**
   * Get all pages (for backwards compatibility)
   */
  getAll(query: string, source?: string): Content[] | null {
    const key = this.getCacheKey(query, source);
    const cached = this.memoryCache.get(key);

    if (!cached) return null;

    if (Date.now() - cached.createdAt > this.CACHE_TTL) {
      this.memoryCache.delete(key);
      return null;
    }

    cached.accessCount++;
    return cached.batches.flat();
  }

  getTop(query: string, count: number, source?: string): Content[] | null {
    const all = this.getAll(query, source);
    if (!all) return null;
    return all.slice(0, count);
  }

  /**
   * Check if we have cached data for a query
   */
  has(query: string, source?: string): boolean {
    const key = this.getCacheKey(query, source);
    const cached = this.memoryCache.get(key);
    
    if (!cached) return false;
    
    if (Date.now() - cached.createdAt > this.CACHE_TTL) {
      this.memoryCache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache statistics
   */
  getStats(query: string, source?: string): CacheStats | null {
    const key = this.getCacheKey(query, source);
    const cached = this.memoryCache.get(key);

    if (!cached) return null;

    return {
      totalPages: cached.batches.length,
      totalResults: cached.totalResults,
      resultsPerPage: this.BATCH_SIZE,
      accessCount: cached.accessCount,
      ageMs: Date.now() - cached.createdAt,
    };
  }

  /**
   * Trim cached results to a maximum top count.
   * If source is omitted, trim all query-specific cache entries.
   */
  trim(query: string, count: number, source?: string): void {
    const normalized = query.toLowerCase().trim();

    const trimEntry = (key: string) => {
      const cached = this.memoryCache.get(key);
      if (!cached) return;

      const allResults = cached.batches.flat();
      if (allResults.length <= count) return;

      const trimmed = allResults.slice(0, count);
      const batches = this.toBatches(trimmed);
      this.memoryCache.set(key, {
        ...cached,
        batches,
        totalResults: trimmed.length,
        createdAt: Date.now(),
      });
    };

    if (source) {
      const key = this.getCacheKey(query, source);
      trimEntry(key);
      return;
    }

    const prefix = `${normalized}:`;
    for (const key of Array.from(this.memoryCache.keys())) {
      if (key === normalized || key.startsWith(prefix)) {
        trimEntry(key);
      }
    }
  }

  /**
   * Clear cache for a specific query and optional source.
   * If source is omitted, remove all cached entries for the query across sources.
   */
  clear(query: string, source?: string): void {
    const normalized = query.toLowerCase().trim();
    if (source) {
      const key = this.getCacheKey(query, source);
      this.memoryCache.delete(key);
      return;
    }

    const prefix = `${normalized}:`;
    for (const key of Array.from(this.memoryCache.keys())) {
      if (key === normalized || key.startsWith(prefix)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Clear the entire search cache.
   */
  clearAll(): void {
    this.memoryCache.clear();
  }

  /**
   * Clear all expired cache entries
   */
  clearExpired(): number {
    let cleared = 0;
    for (const [key, cached] of this.memoryCache.entries()) {
      if (Date.now() - cached.createdAt > this.CACHE_TTL) {
        this.memoryCache.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.memoryCache.size;
  }

  /**
   * Get constant batch/fetch sizes
   */
  getBatchSize(): number {
    return this.BATCH_SIZE;
  }

  getFetchSize(): number {
    return this.FETCH_SIZE;
  }
}

interface CachedSearchResult {
  query: string;
  source: string;
  batches: Content[][];
  totalResults: number;
  createdAt: number;
  accessCount: number;
}

export interface CacheStats {
  totalPages: number;
  totalResults: number;
  resultsPerPage: number;
  accessCount: number;
  ageMs: number;
}

// Singleton instance
export const searchCache = new SearchCache();
