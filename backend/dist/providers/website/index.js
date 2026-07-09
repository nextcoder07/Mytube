"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteProvider = void 0;
const config_1 = __importDefault(require("../../config"));
const uuid_1 = require("uuid");
class WebsiteProvider {
    name = "website";
    async search(query, options) {
        const apiKey = config_1.default.googleCseApiKey;
        const cx = config_1.default.googleCseCx;
        if (!apiKey || !cx) {
            console.warn("Google Custom Search Engine credentials not configured. Website search is disabled.");
            return [];
        }
        try {
            const limit = options?.limit || 50; // Increased from 10
            // Target docs, guides, tutorials, or developer hubs
            const targetQuery = `${query} (site:developer.mozilla.org OR site:dev.to OR site:stackoverflow.com OR site:w3schools.com OR filetype:html)`;
            const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(targetQuery)}&num=${Math.min(limit, 10)}`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`Google CSE API returned status ${res.status}`);
            }
            const data = await res.json();
            const items = data.items || [];
            return items.map((item) => {
                const thumbnail = item.pagemap?.cse_thumbnail?.[0]?.src || item.pagemap?.metatags?.[0]?.["og:image"] || undefined;
                const author = item.displayLink || "Official Docs";
                const snippet = item.snippet || "";
                return {
                    id: `website_${(0, uuid_1.v4)()}`,
                    title: item.title || "Documentation Resource",
                    url: item.link,
                    source: "website",
                    type: "article",
                    thumbnail,
                    description: snippet,
                    author,
                    tags: ["documentation", "web"],
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
            console.error("Website search error:", err.message);
            return [];
        }
    }
}
exports.WebsiteProvider = WebsiteProvider;
//# sourceMappingURL=index.js.map