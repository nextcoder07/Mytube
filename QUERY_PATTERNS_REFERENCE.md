# AI Search Query Patterns - Quick Reference

## GitHub User Profiles

### Supported Formats
```
@username                           # @torvalds
github.com/username                 # github.com/gvanrossum
user: username                      # user: octocat
github username profile             # github torvalds profile
```

### What You Get
- Developer profile with bio
- Follower/following count
- Public repositories count
- Top 10 repositories by stars
- Repository fork counts and issues
- Languages used

### Example Results
```
@torvalds
├── Linus Torvalds - GitHub Profile
│   ├── Followers: 200k+
│   ├── Public repos: 100+
│   └── Bio: Linux creator
├── linux (kernel repo)
├── git (version control)
└── [more repositories...]
```

## YouTube Channels

### Supported Formats
```
@channelname                        # @LinusTechTips
youtube.com/@channelname            # youtube.com/@3Blue1Brown
channel @name                       # channel @VeritasiumDotCom
youtube channel channelname         # youtube channel TED-Ed
```

### What You Get
- Channel information and stats
- Subscriber count
- Channel description
- Latest 10-25 videos
- Video titles and descriptions
- Upload dates
- Video durations and view counts

### Example Results
```
@LinusTechTips
├── LinusTechTips - YouTube Channel
│   ├── Subscribers: 16M+
│   ├── Total videos: 1000+
│   └── Description: Tech reviews...
├── Latest GPU Review
├── Gaming PC Build Guide
└── [more videos...]
```

## Twitter/X Profiles

### Supported Formats
```
@username                           # @elonmusk
twitter.com/username                # twitter.com/jack
x.com/username                      # x.com/satyanadella
```

### What You Get
- Profile information
- Bio and description
- Follower count
- Recent tweets
- Verified status

## Generic Searches

### Supported Formats
```
topic                               # machine learning
topic tutorial                      # python tutorial
learning resource name              # tensorflow guide
question or phrase                  # how to learn web dev
```

### What You Get
- YouTube videos and channels
- GitHub repositories
- Reddit discussions
- Medium articles
- Dev.to blog posts
- Wikipedia articles
- AI-ranked by relevance
- Personalized by your context

## Special Keywords

### Query Modifiers
```
site:youtube.com query              # Force YouTube search
site:github.com query               # Force GitHub search
site:reddit.com query               # Force Reddit search
repo: keyword                       # GitHub repository search
channel: videos                     # YouTube videos search
```

## Query Type Detection

| Input | Detected Type | Provider | Result Type |
|-------|---------------|----------|-------------|
| `@torvalds` | GitHub User | GitHub | profile + repos |
| `@LinusTechTips` | YouTube Channel | YouTube | channel + videos |
| `@elonmusk` | Twitter Profile | Twitter* | profile + tweets* |
| `machine learning` | Generic | All | varied (video/article/repo) |
| `docker tutorial` | Generic | All | varied |
| `awesome lists` | Generic | All | varied |

*Twitter search returns website results

## Detection Priority

When system detects query:
1. **Most specific first:** `@username` → checks GitHub/YouTube/Twitter
2. **URL format:** `github.com/user` → clearly GitHub
3. **Keyword format:** `github user xyz` → GitHub
4. **Generic fallback:** If no pattern matches → all providers

## Personalization Context Examples

### For GitHub Searches
```
"Show me influential developers in web development"
"I want to learn from top Python developers"
"Show me active open-source contributors"
"Find developers working on machine learning projects"
```

### For YouTube Searches
```
"Show me channels with beginner-friendly tutorials"
"I prefer in-depth technical talks"
"Show educational content creators"
"Find channels with practical project-based learning"
```

### For Generic Searches
```
"I'm a beginner, show me step-by-step tutorials"
"Advanced topic, show research papers and implementations"
"I learn best with visual explanations and diagrams"
"Prefer short videos, max 15 minutes"
```

## Search Tips

### ✅ Best Practices
- Use `@` for exact matches: `@username`
- Add context for better AI ranking
- Include your level (beginner/intermediate/advanced)
- Mention format preference (video/article/code)

### ❌ Avoid These
- Misspelled usernames: `@tovalds` (should be `@torvalds`)
- Complex syntax: Mix natural language with format
- Generic + specific: Choose one approach

## Advanced Patterns

### GitHub
```
@torvalds linux kernel           # GitHub user + topic
@gvanrossum python design        # GitHub user + interest
```

### YouTube
```
@LinusTechTips latest reviews    # Channel + type
@3Blue1Brown math videos         # Channel + topic
```

### Combined Search
```
"machine learning from @torvalds perspective"
"Docker tutorial like @LinusTechTips teaches"
```

## Troubleshooting Query Detection

| Issue | Cause | Solution |
|-------|-------|----------|
| No results | User/channel doesn't exist | Check spelling |
| Wrong type detected | Query too generic | Use `@` or URL format |
| Generic results | Pattern not recognized | Use clear format |
| Rate limited | Too many API calls | Wait a moment and retry |

## Performance Tips

- **Fastest:** Exact matches with `@username`
- **Fast:** URL format like `github.com/username`
- **Medium:** Descriptive queries like `github user xyz profile`
- **Slowest:** Generic multi-provider searches (but gets best results!)

## Combine with AI Context

```
Query: "@torvalds"
Context: "I want to understand Linux kernel development from creator's perspective"
→ Returns Torvalds profile + kernel repos with AI explanation of relevance

Query: "@LinusTechTips"
Context: "Show me their latest consumer tech reviews"
→ Returns channel + recent consumer-focused videos

Query: "machine learning"
Context: "Beginner, prefer PyTorch over TensorFlow, like 3Blue1Brown's style"
→ Searches all providers, AI ranks by your preferences
```

---

**Need help?** See `QUICK_START_AI_SEARCH.md` for more examples and usage guide.
