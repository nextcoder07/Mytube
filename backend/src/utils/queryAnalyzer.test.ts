/**
 * Quick test cases for QueryAnalyzer
 * Run with: npx ts-node src/utils/queryAnalyzer.test.ts
 */

import { QueryAnalyzer, QueryType } from "./queryAnalyzer";

const testCases = [
  // GitHub user searches
  {
    query: "@torvalds",
    expected: QueryType.GITHUB_USER,
    description: "GitHub user with @"
  },
  {
    query: "github.com/gvanrossum",
    expected: QueryType.GITHUB_USER,
    description: "GitHub URL format"
  },
  {
    query: "user: johndoe github profile",
    expected: QueryType.GITHUB_USER,
    description: "Descriptive GitHub profile query"
  },

  // YouTube channel searches
  {
    query: "@LinusTechTips",
    expected: QueryType.YOUTUBE_CHANNEL,
    description: "YouTube channel with @"
  },
  {
    query: "youtube.com/@3Blue1Brown",
    expected: QueryType.YOUTUBE_CHANNEL,
    description: "YouTube channel URL"
  },
  {
    query: "channel @CorridorCrew",
    expected: QueryType.YOUTUBE_CHANNEL,
    description: "Descriptive channel search"
  },

  // Generic searches
  {
    query: "machine learning tutorial",
    expected: QueryType.GENERIC,
    description: "Generic search query"
  },
  {
    query: "docker containers kubernetes",
    expected: QueryType.GENERIC,
    description: "Technical topic search"
  }
];

console.log("🧪 QueryAnalyzer Test Suite\n");

let passed = 0;
let failed = 0;

testCases.forEach((test, i) => {
  const result = QueryAnalyzer.analyze(test.query);
  const isPass = result.type === test.expected;
  
  if (isPass) {
    passed++;
    console.log(`✅ Test ${i + 1}: ${test.description}`);
  } else {
    failed++;
    console.log(`❌ Test ${i + 1}: ${test.description}`);
    console.log(`   Query: "${test.query}"`);
    console.log(`   Expected: ${test.expected}, Got: ${result.type}`);
  }
  
  console.log(`   Analysis:`, {
    type: result.type,
    isSpecialized: result.isSpecialized,
    enhancedQuery: result.enhancedQuery,
    providers: result.suggestedProviders,
  });
  console.log();
});

console.log(`\n📊 Results: ${passed}/${testCases.length} passed, ${failed}/${testCases.length} failed`);
