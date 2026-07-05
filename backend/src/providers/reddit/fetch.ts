// providers/reddit/fetch.ts — Fetch a single Reddit post by id
import { Content } from '../../models/content.model';
import { normalizePost } from './normalize';

export async function fetchRedditPost(postId: string): Promise<Content | null> {
  const res = await fetch(`https://www.reddit.com/comments/${postId}.json`, {
    headers: { 'User-Agent': 'MyTube-Personalized-Learning/1.0' },
  });
  if (!res.ok) return null;

  const data: any = await res.json();
  const post = data?.[0]?.data?.children?.[0]?.data;
  if (!post) return null;

  return normalizePost(post);
}
