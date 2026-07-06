"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePost = normalizePost;
function normalizePost(item) {
    return {
        id: `reddit_${item.id}`,
        title: item.title,
        url: `https://www.reddit.com${item.permalink}`,
        source: 'reddit',
        type: 'post',
        thumbnail: item.thumbnail?.startsWith('http') ? item.thumbnail : undefined,
        description: item.selftext?.slice(0, 300) ?? '',
        author: item.author,
        tags: ['reddit', item.subreddit].filter(Boolean),
        language: 'en',
        metadata: {
            subreddit: item.subreddit,
            score: item.score,
            numComments: item.num_comments,
        },
        createdAt: new Date(item.created_utc * 1000),
    };
}
//# sourceMappingURL=normalize.js.map