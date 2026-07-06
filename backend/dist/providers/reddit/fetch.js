"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRedditPost = fetchRedditPost;
const normalize_1 = require("./normalize");
async function fetchRedditPost(postId) {
    const res = await fetch(`https://www.reddit.com/comments/${postId}.json`, {
        headers: { 'User-Agent': 'MyTube-Personalized-Learning/1.0' },
    });
    if (!res.ok)
        return null;
    const data = await res.json();
    const post = data?.[0]?.data?.children?.[0]?.data;
    if (!post)
        return null;
    return (0, normalize_1.normalizePost)(post);
}
//# sourceMappingURL=fetch.js.map