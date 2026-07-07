// src/providers/youtube/index.ts
import { ContentProvider } from "../base.provider";
import { Content, SearchOptions } from "../../models/content.model";

export class YouTubeProvider implements ContentProvider {
  name = "youtube";

  async search(query: string, options?: SearchOptions): Promise<Content[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey === "AIzaSy..." || apiKey.includes("your-")) {
      console.warn("YouTube API Key not set. Using mock YouTube search.");
      return this.getMockResults(query);
    }

    try {
      const perPage = Math.min(options?.limit || 25, 50); // YouTube max is 50
      let allItems: any[] = [];
      let pageToken: string | undefined = options?.pageToken as string | undefined;
      let totalToFetch = options?.limit || 25;
      let fetched = 0;

      // Smart Query Appending: enhance query when AI context is provided
      let effectiveQuery = query;
      if (options?.aiContext) {
        effectiveQuery = `${query} tutorial full course`;
      }

      // Resolve filter params with defaults
      const order = options?.order || 'relevance';
      const relevanceLanguage = options?.relevanceLanguage || 'en';

      // Fetch multiple pages if needed
      while (fetched < totalToFetch) {
        const batchSize = Math.min(perPage, totalToFetch - fetched);

        // Build optimized search URL with all YouTube Data API filters
        let searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet`
          + `&q=${encodeURIComponent(effectiveQuery)}`
          + `&type=video`
          + `&videoEmbeddable=true`
          + `&order=${order}`
          + `&relevanceLanguage=${relevanceLanguage}`
          + `&maxResults=${batchSize}`
          + `&key=${apiKey}`;

        // Optional: Video duration filter (short/medium/long)
        if (options?.videoDuration && options.videoDuration !== 'any') {
          searchUrl += `&videoDuration=${options.videoDuration}`;
        }

        // Optional: Video category filter
        if (options?.videoCategoryId) {
          searchUrl += `&videoCategoryId=${options.videoCategoryId}`;
        }

        if (pageToken) {
          searchUrl += `&pageToken=${pageToken}`;
        }

        const res = await fetch(searchUrl);
        if (!res.ok) {
          throw new Error(`YouTube API returned status ${res.status}`);
        }
        const data: any = await res.json();
        const items = data.items || [];
        allItems.push(...items);
        fetched += items.length;

        pageToken = data.nextPageToken;
        if (!pageToken || items.length === 0) break; // no more pages
      }

      const videoIds = allItems.map((item: any) => item.id.videoId).filter(Boolean);

      // Fetch durations & views in batches of 50
      let detailsMap: Record<string, { duration: number; views: number }> = {};
      for (let i = 0; i < videoIds.length; i += 50) {
        const batch = videoIds.slice(i, i + 50);
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${batch.join(
          ","
        )}&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        if (detailsRes.ok) {
          const detailsData: any = await detailsRes.json();
          (detailsData.items || []).forEach((v: any) => {
            detailsMap[v.id] = {
              duration: this.parseISO8601Duration(v.contentDetails?.duration),
              views: parseInt(v.statistics?.viewCount || "0", 10),
            };
          });
        }
      }

      return allItems.map((item: any): Content => {
        const videoId = item.id.videoId;
        const details = detailsMap[videoId] || { duration: 0, views: 0 };
        return {
          id: `youtube_${videoId}`,
          title: item.snippet.title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          source: "youtube",
          type: "video",
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
          description: item.snippet.description,
          author: item.snippet.channelTitle,
          duration: details.duration,
          viewCount: details.views,
          tags: [this.name, "learning"],
          language: "en",
          metadata: { channelId: item.snippet.channelId },
          createdAt: new Date(item.snippet.publishedAt),
        };
      });
    } catch (err: any) {
      console.error("YouTube search error:", err.message);
      return this.getMockResults(query);
    }
  }

  private parseISO8601Duration(durationStr: string): number {
    if (!durationStr) return 0;
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = durationStr.match(regex);
    if (!matches) return 0;
    const hours = parseInt(matches[1] || "0", 10);
    const minutes = parseInt(matches[2] || "0", 10);
    const seconds = parseInt(matches[3] || "0", 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  private getMockResults(query: string): Content[] {
    return [
      {
        id: "youtube_mock1",
        title: `Introduction to ${query || "Machine Learning"} - Beginners Course`,
        url: "https://www.youtube.com/watch?v=mock1",
        source: "youtube",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
        description: `Get started with ${query || "Machine Learning"} in this comprehensive tutorial for beginners.`,
        author: "Tech Learning Academy",
        duration: 3600,
        viewCount: 150000,
        tags: ["youtube", "tutorial", "beginners"],
        language: "en",
        metadata: {},
        createdAt: new Date(),
      },
      {
        id: "youtube_mock2",
        title: `Advanced ${query || "React"} Concepts Explained`,
        url: "https://www.youtube.com/watch?v=mock2",
        source: "youtube",
        type: "video",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60",
        description: `Dive deep into advanced concepts of ${query || "React"} including custom hooks, context API, and performance optimizations.`,
        author: "Frontend Mastery",
        duration: 1800,
        viewCount: 85000,
        tags: ["youtube", "advanced", "react"],
        language: "en",
        metadata: {},
        createdAt: new Date(),
      },
    ];
  }
}

