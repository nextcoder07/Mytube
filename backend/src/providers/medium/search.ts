// providers/medium/search.ts
import { Content, SearchOptions } from '../../models/content.model';
import { MediumProvider } from './index';

const provider = new MediumProvider();

export async function searchMedium(query: string, options?: SearchOptions): Promise<Content[]> {
  return provider.search(query, options);
}
