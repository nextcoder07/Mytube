// src/providers/website/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

export class WebsiteProvider implements ContentProvider {
  name = "website";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    // Returns high quality documentation and tutorial websites matching the query
    return this.getMockResults(query);
  }

  private getMockResults(query: string): Content[] {
    const q = (query || "web-development").toLowerCase();
    let url = "https://developer.mozilla.org";
    let title = "MDN Web Docs";
    let desc = "Resources for developers, by developers.";

    if (q.includes("python")) {
      url = "https://docs.python.org/3/";
      title = "Python 3 Documentation";
      desc = "The official Python documentation. Tutorials, libraries, and language reference.";
    } else if (q.includes("react")) {
      url = "https://react.dev";
      title = "React Docs — Quick Start";
      desc = "Learn React, components, hooks, state management, and building beautiful user interfaces.";
    } else if (q.includes("git")) {
      url = "https://git-scm.com/doc";
      title = "Git Reference Manual";
      desc = "The official documentation for Git version control system, reference guide, and tutorials.";
    }

    return [
      {
        id: `website_${Buffer.from(url).toString("base64").slice(0, 16)}`,
        title,
        url,
        source: "website",
        type: "article",
        thumbnail: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&auto=format&fit=crop&q=60",
        description: desc,
        author: "Official Documentation",
        tags: ["website", "documentation", "learning-resource"],
        language: "en",
        metadata: {},
        createdAt: new Date(),
      },
    ];
  }
}
