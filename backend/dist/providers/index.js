"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerManager = exports.ProviderManager = void 0;
const youtube_1 = require("./youtube");
const github_1 = require("./github");
const reddit_1 = require("./reddit");
const medium_1 = require("./medium");
const website_1 = require("./website");
const devto_1 = require("./devto");
const wikipedia_1 = require("./wikipedia");
class ProviderManager {
    providers = new Map();
    constructor() {
        // Register all default providers
        this.register(new youtube_1.YouTubeProvider());
        this.register(new github_1.GitHubProvider());
        this.register(new reddit_1.RedditProvider());
        this.register(new medium_1.MediumProvider());
        this.register(new website_1.WebsiteProvider());
        this.register(new devto_1.DevToProvider());
        this.register(new wikipedia_1.WikipediaProvider());
    }
    register(provider) {
        this.providers.set(provider.name.toLowerCase(), provider);
    }
    /**
     * Search all active providers
     */
    async searchAll(query, options) {
        const activeProviderNames = Array.from(this.providers.keys());
        return this.searchSelected(activeProviderNames, query, options);
    }
    /**
     * Search only selected providers in parallel
     */
    async searchSelected(providerNames, query, options) {
        const promises = providerNames.map(async (name) => {
            const provider = this.providers.get(name.toLowerCase());
            if (!provider) {
                console.warn(`Provider ${name} not registered.`);
                return [];
            }
            try {
                return await provider.search(query, options);
            }
            catch (err) {
                console.error(`Error searching provider ${name}:`, err);
                return [];
            }
        });
        const resultsArray = await Promise.allSettled(promises);
        const mergedResults = [];
        resultsArray.forEach((res) => {
            if (res.status === "fulfilled") {
                mergedResults.push(...res.value);
            }
        });
        return mergedResults;
    }
}
exports.ProviderManager = ProviderManager;
exports.providerManager = new ProviderManager();
exports.default = exports.providerManager;
//# sourceMappingURL=index.js.map