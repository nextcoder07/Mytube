// test-youtube-api.ts
// Diagnostic script to test YouTube API keys and rotation system

import { YouTubeProvider } from "./src/providers/youtube/index";

async function testYouTubeAPI() {
  console.log("=".repeat(60));
  console.log("YouTube API Key Rotation Diagnostic");
  console.log("=".repeat(60));

  // Check environment
  console.log("\n1. Environment Variables:");
  console.log(`   YOUTUBE_API_KEYS: ${process.env.YOUTUBE_API_KEYS ? "✅ SET" : "❌ NOT SET"}`);
  
  // Parse keys manually to debug
  const rawKeys = process.env.YOUTUBE_API_KEYS || "";
  console.log(`   Raw value: ${rawKeys.substring(0, 50)}...`);
  
  const keysWithoutQuotes = rawKeys.replace(/^["']|["']$/g, "");
  console.log(`   After strip quotes: ${keysWithoutQuotes.substring(0, 50)}...`);
  
  const parsedKeys = keysWithoutQuotes
    .split(",")
    .map(k => k.trim())
    .filter(k => k && !k.includes("your-"));
  
  console.log(`   Parsed keys count: ${parsedKeys.length}`);
  parsedKeys.forEach((key, i) => {
    const displayKey = key.substring(0, 20) + "..." + key.substring(key.length - 10);
    console.log(`     [${i + 1}] ${displayKey}`);
  });

  // Test YouTube provider
  console.log("\n2. Testing YouTube Provider:");
  const youtube = new YouTubeProvider();

  try {
    console.log("   Searching for 'javascript tutorial'...");
    const results = await youtube.search("javascript tutorial", { limit: 5 });
    
    console.log(`   ✅ Success! Got ${results.length} results`);
    
    if (results.length > 0) {
      console.log("\n   First result:");
      console.log(`     Title: ${results[0].title}`);
      console.log(`     Source: ${results[0].source}`);
      console.log(`     Type: ${results[0].type}`);
      console.log(`     URL: ${results[0].url}`);
      console.log(`     Views: ${results[0].viewCount}`);
    }
  } catch (error) {
    console.error("   ❌ Error:", error instanceof Error ? error.message : String(error));
  }

  // Test specialized channel search
  console.log("\n3. Testing Channel Search:");
  try {
    console.log("   Searching for '@FreeCodeCamp'...");
    const channelResults = await youtube.search("@FreeCodeCamp", { limit: 5 });
    
    console.log(`   ✅ Success! Got ${channelResults.length} results`);
    
    if (channelResults.length > 0) {
      console.log("\n   First result (should be channel):");
      console.log(`     Title: ${channelResults[0].title}`);
      console.log(`     Type: ${channelResults[0].type}`);
      console.log(`     URL: ${channelResults[0].url}`);
    }
  } catch (error) {
    console.error("   ❌ Error:", error instanceof Error ? error.message : String(error));
  }

  console.log("\n" + "=".repeat(60));
  console.log("Diagnostic Complete");
  console.log("=".repeat(60));
}

testYouTubeAPI().catch(console.error);
