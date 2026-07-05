// providers/github/search.ts
import { Content, SearchOptions } from '../../models/content.model';
import { GitHubProvider } from './index';

const provider = new GitHubProvider();

export async function searchGitHub(query: string, options?: SearchOptions): Promise<Content[]> {
  return provider.search(query, options);
}
