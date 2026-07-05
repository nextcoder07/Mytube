// src/providers/base.provider.ts
import { Content, SearchOptions } from "../models/content.model";

export interface ContentProvider {
  name: string;
  search(query: string, options?: SearchOptions): Promise<Content[]>;
  fetch?(id: string): Promise<Content>;
}
