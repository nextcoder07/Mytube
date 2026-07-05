// providers/youtube/search.ts — YouTube search function
import { Content, SearchOptions } from '../../models/content.model';
import { YouTubeProvider } from './index';

const provider = new YouTubeProvider();

export async function searchYouTube(query: string, options?: SearchOptions): Promise<Content[]> {
  return provider.search(query, options);
}
