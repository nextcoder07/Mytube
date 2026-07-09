// test-frontend-search.ts
// Simulate exactly what the frontend is doing

import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

import { SearchService } from "./src/services/search.service";

async function testSearchLikeFrontend() {
  console.log("=".repeat(70));
  console.log("Simulating Frontend Search Requests");
  console.log("=".repeat(70));

  // Test 1: Search without specifying providers (what frontend probably does)
  console.log(`\n▶ Test 1: Basic search (no providers specified) - like frontend probably does`);
  console.log("   Calling: SearchService.search(userId, 'car', { })");
  try {
    const results = await SearchService.search("test-user", "car", {});
    console.log(`   ✅ Got ${results.length} total results`);

    const bySource: Record<string, number> = {};
    results.forEach(r => {
      bySource[r.source] = (bySource[r.source] || 0) + 1;
    });
    console.log("   Breakdown by source:");
    Object.entries(bySource)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        const percentage = ((count / results.length) * 100).toFixed(1);
        console.log(`     • ${source.padEnd(10)}: ${count.toString().padStart(3)} (${percentage}%)`);
      });
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Test 2: Search with explicit high limit
  console.log(`\n▶ Test 2: Search with limit=200`);
  console.log("   Calling: SearchService.search(userId, 'car', { limit: 200 })");
  try {
    const results = await SearchService.search("test-user", "car", { limit: 200 });
    console.log(`   ✅ Got ${results.length} total results`);

    const bySource: Record<string, number> = {};
    results.forEach(r => {
      bySource[r.source] = (bySource[r.source] || 0) + 1;
    });
    console.log("   Breakdown by source:");
    Object.entries(bySource)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        const percentage = ((count / results.length) * 100).toFixed(1);
        console.log(`     • ${source.padEnd(10)}: ${count.toString().padStart(3)} (${percentage}%)`);
      });
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Test 3: Check what individual providers return
  console.log(`\n▶ Test 3: What each provider returns for 'car'`);
  const providerManager = require("./src/providers").default;
  const providers = ["youtube", "github", "reddit", "medium", "website", "devto", "wikipedia"];

  for (const provider of providers) {
    try {
      const results = await providerManager.searchSelected([provider], "car", { limit: 100 });
      console.log(`   • ${provider.padEnd(10)}: ${results.length} results`);
    } catch (error) {
      console.log(`   • ${provider.padEnd(10)}: ❌ Error`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log("Test Complete");
  console.log("=".repeat(70));
}

testSearchLikeFrontend().catch(console.error);
