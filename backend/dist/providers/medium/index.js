"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediumProvider = void 0;
/**
 * Medium provider — searches via Medium's RSS/Atom feed and their unofficial
 * tag-based feed endpoints. No API key required.
 * Strategy:
 *   1. Use Medium's tag RSS: https://medium.com/tag/{tag}/feed
 *   2. Supplement with a DuckDuckGo-scoped search on site:medium.com
 */
class MediumProvider {
    name = "medium";
    async search(query, options) {
        const results = [];
        const limit = options?.limit || 25;
        try {
            // Convert query into URL-safe slug (take first 3 meaningful words as tag)
            const tagSlug = query
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .join("-");
            // --- Strategy 1: Medium Tag RSS Feed ---
            const rssUrl = `https://medium.com/feed/tag/${encodeURIComponent(tagSlug)}`;
            try {
                const rssRes = await fetch(rssUrl, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; MyTube-Learning-Bot/1.0)",
                    },
                    signal: AbortSignal.timeout(8000),
                });
                if (rssRes.ok) {
                    const xml = await rssRes.text();
                    const items = this.parseRSS(xml, limit);
                    results.push(...items);
                }
            }
            catch (rssErr) {
                // RSS may fail on some tags — that's OK, fall through to DDG
                const msg = rssErr instanceof Error ? rssErr.message : String(rssErr);
                console.warn(`[Medium] RSS feed failed for tag "${tagSlug}":`, msg);
            }
            // --- Strategy 2: DuckDuckGo scoped search on site:medium.com ---
            if (results.length < limit) {
                const needed = limit - results.length;
                const ddgResults = await this.searchViaDDG(query, needed);
                results.push(...ddgResults);
            }
            return results.slice(0, limit);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("Medium search error:", message);
            return results;
        }
    }
    /** Parse Medium RSS XML and extract article items */
    parseRSS(xml, limit) {
        const items = [];
        const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
        for (const block of itemBlocks.slice(0, limit)) {
            const title = this.extractTag(block, "title");
            const link = this.extractTag(block, "link");
            const description = this.extractTag(block, "description");
            const pubDate = this.extractTag(block, "pubDate");
            const creator = this.extractTag(block, "dc:creator");
            const thumbnail = this.extractImageFromContent(block);
            if (!title || !link)
                continue;
            // Strip HTML from description snippet
            const cleanDesc = description
                .replace(/<[^>]*>/g, " ")
                .replace(/&[a-z]+;/gi, " ")
                .replace(/\s+/g, " ")
                .trim()
                .substring(0, 280);
            items.push({
                id: `medium_${Buffer.from(link).toString("base64").substring(0, 20)}`,
                title: title.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
                url: link.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
                source: "medium",
                type: "article",
                thumbnail: thumbnail || undefined,
                description: cleanDesc || undefined,
                author: creator || undefined,
                tags: ["medium", "article"],
                language: "en",
                metadata: {},
                createdAt: pubDate ? new Date(pubDate) : new Date(),
            });
        }
        return items;
    }
    extractTag(xml, tag) {
        // Handle both <tag>value</tag> and CDATA
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
        const match = xml.match(regex);
        if (!match)
            return "";
        return match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim();
    }
    extractImageFromContent(block) {
        // Try to find og:image or img src in RSS content
        const imgMatch = block.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)[^\s"'<>]*/i) ||
            block.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (!imgMatch)
            return "";
        return imgMatch[1] || imgMatch[0] || "";
    }
    /** Fallback: scrape site:medium.com results from DuckDuckGo HTML */
    async searchViaDDG(query, limit) {
        const results = [];
        try {
            const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " site:medium.com")}`;
            const res = await fetch(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
                signal: AbortSignal.timeout(8000),
            });
            if (!res.ok)
                return results;
            const html = await res.text();
            const parts = html.split('<div class="result ');
            for (let i = 1; i < parts.length && results.length < limit; i++) {
                const part = parts[i];
                if (part.includes('class="badge--ad"') || part.includes("result--ad"))
                    continue;
                const titleMatch = part.match(/<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>/);
                const snippetMatch = part.match(/<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
                if (!titleMatch)
                    continue;
                const title = titleMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
                const hrefMatch = titleMatch[0].match(/href="([^"]+)"/);
                if (!hrefMatch)
                    continue;
                let rawUrl = hrefMatch[1];
                if (rawUrl.startsWith("//"))
                    rawUrl = "https:" + rawUrl;
                let actualUrl = rawUrl;
                try {
                    const u = new URL(rawUrl);
                    actualUrl = u.searchParams.get("uddg") || rawUrl;
                }
                catch {
                    /* keep rawUrl */
                }
                // Only accept medium.com URLs
                if (!actualUrl.includes("medium.com"))
                    continue;
                const description = snippetMatch
                    ? snippetMatch[1].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
                    : "";
                results.push({
                    id: `medium_${Buffer.from(actualUrl).toString("base64").substring(0, 20)}`,
                    title,
                    url: actualUrl,
                    source: "medium",
                    type: "article",
                    description: description || undefined,
                    author: "Medium",
                    tags: ["medium", "article"],
                    language: "en",
                    metadata: {},
                    createdAt: new Date(),
                });
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn("[Medium] DDG fallback error:", msg);
        }
        return results;
    }
}
exports.MediumProvider = MediumProvider;
//# sourceMappingURL=index.js.map