// src/providers/medium/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

export class MediumProvider implements ContentProvider {
  name = "medium";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    console.warn("Medium provider has no live search integration configured. Returning no results.");
    return [];
  }
}
