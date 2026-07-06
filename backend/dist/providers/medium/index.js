"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediumProvider = void 0;
class MediumProvider {
    name = "medium";
    async search(query, options) {
        // Medium has no open search API, but we can search via a public RSS feed generator or return high quality articles.
        // For local dev and simplicity, we return rich learning articles matching the query.
        return this.getMockResults(query);
    }
    getMockResults(query) {
        return [
            {
                id: "medium_mock1",
                title: `Understanding ${query || "System Design"}: A Step-by-Step Guide`,
                url: "https://medium.com/engineering/system-design-guide",
                source: "medium",
                type: "article",
                thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop&q=60",
                description: `This article breaks down complex system design concepts like load balancers, database sharding, and caching into simple, understandable analogies.`,
                author: "Alex Mercer",
                viewCount: 1200,
                tags: ["medium", "system-design", "software-engineering"],
                language: "en",
                metadata: { claps: 1200, readTime: "8 min read" },
                createdAt: new Date(),
            },
            {
                id: "medium_mock2",
                title: `How I Mastered ${query || "Web Dev"} in 6 Months`,
                url: "https://medium.com/tech-learning/mastering-web-dev",
                source: "medium",
                type: "article",
                thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60",
                description: `A complete breakdown of my daily schedule, free resources used, and projects built to transition from zero coding knowledge to a full-stack engineer.`,
                author: "Sarah Connor",
                viewCount: 3400,
                tags: ["medium", "career", "webdev"],
                language: "en",
                metadata: { claps: 3400, readTime: "12 min read" },
                createdAt: new Date(),
            },
        ];
    }
}
exports.MediumProvider = MediumProvider;
//# sourceMappingURL=index.js.map