// test-full-search.ts
// Test the complete search functionality with all providers

import dotenv from "dotenv";
import path from "path";
import { SearchService } from "./src/services/search.service";

// Load .env explicitly
const envPath = path.resolve(__dirname, ".env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("⚠️  Error loading .env:", result.error.message);
} else {
  console.log("✅ .env loaded from:", envPath);
}

async function testFullSearch() {
  console.log("\n" + "=".repeat(70));
  console.log("Full Search Test - All Providers");
  console.log("=".repeat(70));

  const testQueries = [
    { query: "cars", context: "generic search" },
    { query: "machine learning", context: "AI/learning context" },
    { query: "@octocat", context: "GitHub user pattern" },
    { query: "javascript tutorial", context: "coding tutorial" },
  ];

  for (const test of testQueries) {
    console.log(`\n▶ Testing: "${test.query}" (${test.context})`);
    console.log("-".repeat(70));

    try {
      const results = await SearchService.search("test-user", test.query, {
        providers: ["youtube", "github", "reddit", "medium", "website", "devto", "wikipedia"],
        limit: 50
      });

      console.log(`   ✅ Got ${results.length} results`);

      // Breakdown by source
      const bySource: Record<string, number> = {};
      results.forEach(r => {
        bySource[r.source] = (bySource[r.source] || 0) + 1;
      });

      console.log("   Provider breakdown:");
      Object.entries(bySource)
        .sort((a, b) => b[1] - a[1])
        .forEach(([source, count]) => {
          const percentage = ((count / results.length) * 100).toFixed(1);
          console.log(`     • ${source.padEnd(10)} : ${count.toString().padStart(3)} results (${percentage}%)`);
        });

      // Show first result from each provider
      console.log("\n   Sample results (first from each provider):");
      const firstPerProvider = new Map<string, any>();
      results.forEach(r => {
        if (!firstPerProvider.has(r.source)) {
          firstPerProvider.set(r.source, r);
        }
      });

      Array.from(firstPerProvider.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([source, item]) => {
          console.log(`     • [${source.toUpperCase()}] ${item.title.substring(0, 60)}`);
          console.log(`       Type: ${item.type} | URL: ${item.url.substring(0, 60)}`);
        });

    } catch (error) {
      console.error("   ❌ Error:", error instanceof Error ? error.message : String(error));
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("Full Search Test Complete");
  console.log("=".repeat(70));
}

testFullSearch().catch(console.error);
