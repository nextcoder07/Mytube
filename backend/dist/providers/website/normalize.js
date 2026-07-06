"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePage = normalizePage;
const uuid_1 = require("uuid");
function extractMeta(html, property) {
    const match = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
        ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'));
    return match?.[1] ?? '';
}
function extractTitle(html) {
    const og = extractMeta(html, 'og:title');
    if (og)
        return og;
    const match = html.match(/<title>([^<]+)<\/title>/i);
    return match?.[1] ?? 'Untitled';
}
function normalizePage(html, url) {
    return {
        id: `website_${(0, uuid_1.v4)()}`,
        title: extractTitle(html),
        url,
        source: 'website',
        type: 'article',
        thumbnail: extractMeta(html, 'og:image') || undefined,
        description: extractMeta(html, 'og:description'),
        author: extractMeta(html, 'article:author') || undefined,
        tags: ['website'],
        language: 'en',
        metadata: {},
        createdAt: new Date(),
    };
}
//# sourceMappingURL=normalize.js.map