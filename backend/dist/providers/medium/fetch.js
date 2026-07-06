"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMediumArticle = fetchMediumArticle;
const normalize_1 = require("./normalize");
async function fetchMediumArticle(url) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'MyTube-Personalized-Learning/1.0' } });
        if (!res.ok)
            return null;
        const html = await res.text();
        return (0, normalize_1.normalizeArticle)(html, url);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=fetch.js.map