"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediumProvider = void 0;
const config_1 = __importDefault(require("../../config"));
const uuid_1 = require("uuid");
class MediumProvider {
    name = "medium";
    async search(query, options) {
        const apiKey = config_1.default.googleCseApiKey;
        const cx = config_1.default.googleCseCx;
        if (!apiKey || !cx) {
            console.warn("Google Custom Search Engine credentials not configured. Medium search is disabled.");
            return [];
        }
        try {
            const totalToFetch = Math.max(options?.limit || 70, 70);
            const targetQuery = `${query} site:medium.com`;
            let startIndex = 1;
            let allItems = [];
            while (allItems.length < totalToFetch) {
                const batchSize = Math.min(10, totalToFetch - allItems.length);
                const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(targetQuery)}&num=${batchSize}&start=${startIndex}`;
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`Google CSE API returned status ${res.status}`);
                }
                const data = await res.json();
                const items = data.items || [];
                if (items.length === 0)
                    break;
                allItems.push(...items);
                startIndex += items.length;
                if (items.length < batchSize)
                    break;
            }
            return allItems.slice(0, totalToFetch).map((item) => {
                const thumbnail = item.pagemap?.cse_thumbnail?.[0]?.src || item.pagemap?.metatags?.[0]?.["og:image"] || undefined;
                const author = item.pagemap?.metatags?.[0]?.["author"] || item.pagemap?.metatags?.[0]?.["twitter:creator"] || "Medium Author";
                const snippet = item.snippet || "";
                return {
                    id: `medium_${(0, uuid_1.v4)()}`,
                    title: item.title || "Untitled Article",
                    url: item.link,
                    source: "medium",
                    type: "article",
                    thumbnail,
                    description: snippet,
                    author,
                    tags: ["medium", "article"],
                    language: "en",
                    metadata: {
                        displayLink: item.displayLink,
                        formattedUrl: item.formattedUrl,
                    },
                    createdAt: new Date(),
                };
            });
        }
        catch (err) {
            console.error("Medium search error:", err.message);
            return [];
        }
    }
}
exports.MediumProvider = MediumProvider;
//# sourceMappingURL=index.js.map