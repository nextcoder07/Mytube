"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeArticle = normalizeArticle;
const uuid_1 = require("uuid");
function extractMeta(html, property) {
    const match = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'))
        ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'));
    return match?.[1] ?? '';
}
function normalizeArticle(html, url) {
    const title = extractMeta(html, 'og:title') || 'Untitled Article';
    const description = extractMeta(html, 'og:description');
    const thumbnail = extractMeta(html, 'og:image');
    const author = extractMeta(html, 'article:author');
    return {
        id: `medium_${(0, uuid_1.v4)()}`,
        title,
        url,
        source: 'medium',
        type: 'article',
        thumbnail: thumbnail || undefined,
        description,
        author: author || undefined,
        tags: ['medium', 'article'],
        language: 'en',
        metadata: {},
        createdAt: new Date(),
    };
}
//# sourceMappingURL=normalize.js.map