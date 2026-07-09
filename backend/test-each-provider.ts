// test-each-provider.ts
// Test each provider independently to see which ones work

import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

import { YouTubeProvider } from "./src/providers/youtube";
import { GitHubProvider } from "./src/providers/github";
import { RedditProvider } from "./src/providers/reddit";
import { MediumProvider } from "./src/providers/medium";
import { WebsiteProvider } from "./src/providers/website";
import { DevToProvider } from "./src/providers/devto";
import { WikipediaProvider } from "./src/providers/wikipedia";

const query = "javascript tutorial";

async function testProvider(provider: any, name: string) {
  console.log(`\n▶ Testing ${name}...`);
  try {
    const results = await provider.search(query, { limit: 50 });
    console.log(`   ✅ Got ${results.length} results`);
    if (results.length > 0) {
      console.log(`      Sample: ${results[0].title.substring(0, 60)}`);
      console.log(`      Source: ${results[0].source}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function testAllProviders() {
  console.log("=".repeat(70));
  console.log(`Testing all providers with query: "${query}"`);
  console.log("=".repeat(70));

  await testProvider(new YouTubeProvider(), "YouTube");
  await testProvider(new GitHubProvider(), "GitHub");
  await testProvider(new RedditProvider(), "Reddit");
  await testProvider(new MediumProvider(), "Medium");
  await testProvider(new WebsiteProvider(), "Website");
  await testProvider(new DevToProvider(), "Dev.to");
  await testProvider(new WikipediaProvider(), "Wikipedia");

  console.log("\n" + "=".repeat(70));
  console.log("Testing Complete");
  console.log("=".repeat(70));
}

testAllProviders().catch(console.error);
