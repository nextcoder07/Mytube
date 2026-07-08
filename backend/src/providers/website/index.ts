// src/providers/website/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

export class WebsiteProvider implements ContentProvider {
  name = "website";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    console.warn("Website provider has no live search integration configured. Returning no results.");
    return [];
  }
}
