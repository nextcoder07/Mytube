// src/providers/index.ts
import { ContentProvider } from "./base.provider";
import { YouTubeProvider } from "./youtube";
import { GitHubProvider } from "./github";
import { RedditProvider } from "./reddit";
import { MediumProvider } from "./medium";
import { WebsiteProvider } from "./website";
import { DevToProvider } from "./devto";
import { WikipediaProvider } from "./wikipedia";
import { Content, SearchOptions } from "../models/content.model";

export class ProviderManager {
  private providers = new Map<string, ContentProvider>();

  constructor() {
    // Register all default providers
    this.register(new YouTubeProvider());
    this.register(new GitHubProvider());
    this.register(new RedditProvider());
    this.register(new MediumProvider());
    this.register(new WebsiteProvider());
    this.register(new DevToProvider());
    this.register(new WikipediaProvider());
  }

  register(provider: ContentProvider): void {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  /**
   * Search all active providers
   */
  async searchAll(query: string, options?: SearchOptions): Promise<Content[]> {
    const activeProviderNames = Array.from(this.providers.keys());
    return this.searchSelected(activeProviderNames, query, options);
  }

  /**
   * Search only selected providers in parallel
   */
  async searchSelected(
    providerNames: string[],
    query: string,
    options?: SearchOptions
  ): Promise<Content[]> {
    const promises = providerNames.map(async (name) => {
      const provider = this.providers.get(name.toLowerCase());
      if (!provider) {
        console.warn(`Provider ${name} not registered.`);
        return [];
      }
      try {
        return await provider.search(query, options);
      } catch (err) {
        console.error(`Error searching provider ${name}:`, err);
        return [];
      }
    });

    const resultsArray = await Promise.allSettled(promises);
    const mergedResults: Content[] = [];

    resultsArray.forEach((res) => {
      if (res.status === "fulfilled") {
        mergedResults.push(...res.value);
      }
    });

    return mergedResults;
  }

  getProvider(name: string): ContentProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  async searchProvider(
    providerName: string,
    query: string,
    options?: SearchOptions
  ): Promise<Content[]> {
    const provider = this.getProvider(providerName);
    if (!provider) {
      console.warn(`Provider ${providerName} not registered.`);
      return [];
    }

    try {
      return await provider.search(query, options);
    } catch (err) {
      console.error(`Error searching provider ${providerName}:`, err);
      return [];
    }
  }
}

export const providerManager = new ProviderManager();
export default providerManager;
