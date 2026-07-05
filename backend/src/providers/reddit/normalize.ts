// providers/reddit/normalize.ts — Normalize raw Reddit post → Content
import { Content } from '../../models/content.model';

export function normalizePost(item: any): Content {
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
