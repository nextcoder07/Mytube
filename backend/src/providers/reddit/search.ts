// providers/reddit/search.ts
import { Content, SearchOptions } from '../../models/content.model';
import { RedditProvider } from './index';

const provider = new RedditProvider();

export async function searchReddit(query: string, options?: SearchOptions): Promise<Content[]> {
  return provider.search(query, options);
}
