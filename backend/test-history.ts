// test-history.ts
import dotenv from "dotenv";
import path from "path";

// Load env if exists
dotenv.config();

import HistoryService from "./src/services/history.service";
import { Content } from "./src/models/content.model";

const mockContent: Content = {
  id: "test-video-101",
  title: "TypeScript Deep Dive Tutorial",
  url: "https://www.youtube.com/watch?v=test101",
  source: "youtube",
  type: "video",
  thumbnail: "https://img.youtube.com/vi/test101/0.jpg",
  description: "A comprehensive guide to TypeScript advanced features.",
  author: "Code Academy",
  duration: 1200,
  tags: ["typescript", "javascript", "programming"],
  language: "en",
  metadata: { views: 5000 },
  createdAt: new Date(),
};

async function testHistory() {
  console.log("=".repeat(50));
  console.log("Running History Service Tests...");
  console.log("=".repeat(50));

  const userId = "mock-user-123";

  try {
    console.log("\n1. Testing recordWatch...");
    const saved = await HistoryService.recordWatch(userId, mockContent);
    console.log("✅ Successfully saved watch history entry:", JSON.stringify(saved, null, 2));

    console.log("\n2. Testing getWatchHistory...");
    const history = await HistoryService.getWatchHistory(userId);
    console.log(`✅ Successfully fetched ${history.length} watch history entries.`);
    if (history.length > 0) {
      console.log("Sample entry:", JSON.stringify(history[0], null, 2));
    }
  } catch (error: any) {
    console.log("❌ Test failed:", error.message || error);
    console.log("Note: This failure is expected if local database credentials are not configured in your environment.");
  }

  console.log("\n" + "=".repeat(50));
  console.log("Tests Completed.");
  console.log("=".repeat(50));
}

testHistory();
