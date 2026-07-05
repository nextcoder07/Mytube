// providers/youtube/normalize.ts — Normalize raw YouTube API item → Content
import { Content } from '../../models/content.model';

function parseISO8601Duration(dur: string): number {
  if (!dur) return 0;
  const m = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || '0') * 3600) + (parseInt(m[2] || '0') * 60) + parseInt(m[3] || '0');
}

export function normalizeVideo(item: any): Content {
  const videoId: string = item.id?.videoId ?? item.id;
  return {
    id: `youtube_${videoId}`,
    title: item.snippet.title,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    source: 'youtube',
    type: 'video',
    thumbnail: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url,
    description: item.snippet.description,
    author: item.snippet.channelTitle,
    duration: parseISO8601Duration(item.contentDetails?.duration),
    tags: ['youtube'],
    language: 'en',
    metadata: {
      channelId: item.snippet.channelId,
      viewCount: parseInt(item.statistics?.viewCount ?? '0', 10),
    },
    createdAt: new Date(item.snippet.publishedAt),
  };
}
