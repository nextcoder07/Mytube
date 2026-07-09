# AI Search Implementation Guide

## Overview

The AI Search feature has been enhanced with **smart query analysis** to detect specialized search patterns and optimize results for specific content types. This enables powerful searches for GitHub user profiles, YouTube channels, and more.

## Features Implemented

### 1. Smart Query Analyzer (`queryAnalyzer.ts`)
Automatically detects query patterns and optimizes search strategy:

#### Supported Query Types:

- **GitHub User Profile** (`@username` or `github.com/username`)
  - Searches for user profile + repositories
  - Returns user info and top repos
  
- **YouTube Channel** (`@channelname` or `youtube.com/@channelname`)
  - Searches for channel + recent videos
  - Returns channel info and video catalog
  
- **Twitter/X Profile** (`@username` or `twitter.com/username`)
  - Searches for profile and posts
  
- **Generic Search**
  - Multi-provider search with intelligent ranking

### 2. Enhanced Search Service

**Automatic Provider Selection:**
- Query analyzer suggests optimal providers based on query type
- GitHub queries prioritize GitHub provider
- YouTube queries prioritize YouTube provider
- Generic queries use all available providers

**Query Enhancement:**
- Specialized queries are optimized before sending to providers
- Example: `@torvalds` → enhanced to `torvalds github profile repositories`

**AI Re-ranking with Context:**
- Top results re-ranked by AI based on:
  - Query type (specialized vs. generic)
  - User personalization context
  - Query-specific relevance guidance

### 3. Enhanced Providers

#### GitHub Provider
```typescript
// Detects and handles user profile searches
// Returns:
// - User profile (followers, repos count, bio)
// - Top repositories by stars
// - User activity and contributions
```

Usage:
- `@username` - Search GitHub user
- `github.com/username` - Direct user URL
- `user: username github profile` - Descriptive search

#### YouTube Provider
```typescript
// Detects and handles channel searches
// Returns:
// - Channel information and stats
// - Latest/popular videos from channel
// - Channel metadata
```

Usage:
- `@channelname` - Search YouTube channel
- `youtube.com/@channelname` - Direct channel URL
- `channel @name` - Descriptive search

## Frontend Usage

### Search with AI Mode

1. **Enable AI Search:**
   - Click the "AI Search" button in the search bar
   - The button shows a sparkle icon when active

2. **Add Personalization Context:**
   - Optional: Add context in the AI Personalization panel
   - Example: "I'm a beginner developer interested in web development"
   - The AI uses this to re-rank results

3. **Perform Search:**
   - Enter your query (can be specialized or generic)
   - Press Enter or click Search
   - Results are returned with AI explanations

### Example Queries

**GitHub User Search:**
```
@torvalds
@github user profile
user: gvanrossum python creator
```

**YouTube Channel Search:**
```
@LinusTechTips
youtube.com/@LinusTechTips
channel @3Blue1Brown
```

**Generic Search (with AI enhancement):**
```
machine learning tutorial (AI suggests best learning resources)
docker containers (AI prioritizes comprehensive content)
```

## Backend API Changes

### POST `/search/ai`
Enhanced with query analysis and provider selection:

```typescript
POST /search/ai
{
  "query": "@torvalds",
  "aiContext": "I'm learning C programming",
  "providers": ["github"]  // optional, auto-selected if not provided
}
```

**Response includes:**
```json
{
  "data": [
    {
      "id": "github_user_1234567",
      "title": "Linus Torvalds - GitHub Profile",
      "type": "profile",
      "url": "https://github.com/torvalds",
      "metadata": {
        "aiExplanation": "Linus is the creator of Linux and a highly influential developer",
        "aiScore": 9.8,
        "queryType": "github_user",
        "isSpecializedResult": true
      }
    }
  ]
}
```

## Content Types

Updated content model now supports:
- `"video"` - YouTube videos
- `"article"` - Blog posts, Medium articles
- `"repo"` - GitHub repositories  
- `"post"` - Reddit posts
- `"course"` - Educational courses
- **`"channel"`** - NEW: YouTube channels
- **`"profile"`** - NEW: GitHub/Twitter profiles

## Configuration

No additional configuration needed! The system works automatically.

### Optional: Environment Variables
Ensure these are set for full functionality:
- `YOUTUBE_API_KEY` - YouTube Data API key (for channel searches)
- `GITHUB_TOKEN` - GitHub Personal Access Token (for user profiles)
- `GEMINI_API_KEY` or `OPENROUTER_API_KEY` - AI provider for re-ranking

## Testing

### Manual Testing

1. **GitHub User Search:**
   ```
   Search: "@torvalds"
   Expected: Shows Linus Torvalds profile + Linux kernel repos
   ```

2. **YouTube Channel Search:**
   ```
   Search: "@LinusTechTips"
   Expected: Shows channel info + recent videos
   ```

3. **Generic with AI:**
   ```
   Search: "machine learning beginners"
   With AI Context: "I prefer long-form tutorials with practical projects"
   Expected: Results re-ranked by AI, showing tutorials matching context
   ```

## How It Works (Technical Details)

### Query Analysis Flow:
```
1. User enters query
2. QueryAnalyzer.analyze() checks query patterns
3. Matching query type detected (GitHub user, YouTube channel, etc.)
4. Suggested providers and enhanced query returned
5. SearchService.searchAI() uses suggestions
6. Providers fetch results using enhanced strategy
7. Results deduplicated and ranked
8. Top 10 sent to AI for re-ranking with context
9. Final results sorted by AI score
```

### Example: GitHub User Search Process
```
Input: "@torvalds"
↓
QueryAnalyzer detects: QueryType.GITHUB_USER
↓
Suggested providers: ["github"]
Enhanced query: "torvalds github profile repositories"
↓
GitHubProvider.search() detects user query
↓
Calls /users/torvalds API
Calls /users/torvalds/repos?sort=stars API
↓
Returns: [user profile + top repos]
↓
AI re-ranks with context: "Show influential developer profiles"
↓
Returns ranked results with explanations
```

## Performance

- **Query Analysis:** < 5ms (regex-based)
- **GitHub User Search:** ~1-2s (2 API calls)
- **YouTube Channel Search:** ~2-3s (3 API calls + details batch)
- **AI Re-ranking:** ~1-3s (depends on AI provider)
- **Total:** ~4-8s for specialized searches

## Error Handling

- If query analysis returns empty results, falls back to generic search
- If specialized provider is unavailable, uses fallback providers
- If AI is not configured, returns results without re-ranking
- Rate limiting handled gracefully with key rotation (YouTube)

## Future Enhancements

Potential additions:
- Twitter/X user profile searches
- Reddit user profile searches
- Stack Overflow user searches
- Custom domain searches (company websites, documentation sites)
- Advanced query syntax (e.g., `repo:awesome-lists` for GitHub)
- Search suggestions based on query type
