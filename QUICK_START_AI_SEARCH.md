# AI Search - Quick Start Guide

## What's New

Your AI Search now supports **smart pattern detection** for specialized queries:
- 🔍 **GitHub User Profiles** - Find developers and their top projects
- 📺 **YouTube Channels** - Discover channels and their content
- 🌐 **Generic AI Search** - Multi-source search with AI re-ranking
- 💡 **Personalization** - AI understands your learning style and preferences

## How to Use

### 1. Access AI Search

1. Go to the **Search page**
2. Click the **"AI Search"** button (sparkle icon) to enable it
3. The AI Personalization panel appears below

### 2. Customize Your Search (Optional)

Add personalization context in the **AI Personalization Context** textbox:

**Examples:**
```
"I'm a beginner Python developer, show me tutorials with practical projects"

"I prefer short-form content, max 20 minutes"

"Show me advanced topics with research papers and academic resources"

"I learn best with visual content and live coding examples"
```

### 3. Enter Your Query

Type your search query. The AI will automatically detect specialized patterns:

## Query Examples

### 🚀 GitHub User Searches

Find a developer's profile and their best projects:

```
@torvalds
@gvanrossum
github.com/dhh
user: octocat github profile
```

**Returns:**
- Developer profile with bio and stats
- Top repositories by stars
- Contribution activity

### 📺 YouTube Channel Searches

Discover a channel and browse their content:

```
@LinusTechTips
@3Blue1Brown
youtube.com/@VeritasiumDotCom
channel @MarquesBrownlee
```

**Returns:**
- Channel information and subscriber count
- Latest/popular videos from the channel
- Video descriptions and upload dates

### 📚 Topic Searches (AI Enhanced)

Regular topic searches get AI re-ranking and personalization:

```
machine learning tutorial
docker containers for beginners
web development with React
advanced Python metaprogramming
```

**What happens:**
1. ✅ Searches across YouTube, GitHub, Reddit, Medium, etc.
2. ✅ AI re-ranks results based on your context
3. ✅ Shows AI explanation for each result
4. ✅ Top results match your learning style

## Advanced Usage

### Combining Query Types with Context

```
Query: "@torvalds"
Context: "I want to understand Linux kernel development process"

Result: Linus Torvalds profile + Linux kernel repos + AI explanation
```

### Learning Path Example

```
Query: "learn web development"
Context: "Beginner, prefer step-by-step tutorials with projects, React and Node.js"

Result: Tutorials, courses, and projects specifically for your level
```

### Research Example

```
Query: "machine learning research"
Context: "Advanced practitioner, interested in transformers and NLP, show papers and implementations"

Result: Academic papers, advanced tutorials, reference implementations
```

## Tips & Tricks

### ✨ Best Practices

1. **Be Specific with @ Queries**
   - `@username` works best for exact names
   - Add context for broader results: `"@torvalds linux kernel development"`

2. **Use Natural Language**
   - Don't worry about exact formatting
   - `"github user torvalds"` works like `@torvalds`

3. **Personalization Matters**
   - More specific context = better results
   - Include: level (beginner/intermediate/advanced), format preferences, interests

4. **Try Multiple Searches**
   - `@torvalds` finds the person
   - `linux kernel tutorial` finds learning content
   - Combine both for research!

### 🎯 Query Templates

**For Learning:**
```
Query: "[topic] tutorial"
Context: "I'm a [level] and prefer [format], interested in [specific area]"
```

**For Finding People/Projects:**
```
Query: "@[username]"
Context: "Show me their work in [specific domain]"
```

**For Research:**
```
Query: "[topic] advanced"
Context: "I want [papers/implementations/case studies]"
```

## What Gets Searched

### Default Providers (can mix and match):
- ✅ **YouTube** - Videos and channels
- ✅ **GitHub** - Repositories and developers
- ✅ **Reddit** - Community discussions
- ✅ **Medium** - Technical articles
- ✅ **Dev.to** - Developer blogs
- ✅ **Wikipedia** - General knowledge

### Specialized Searches Prioritize:
- GitHub user queries → GitHub provider only
- YouTube channel queries → YouTube provider only
- Generic queries → All providers with AI re-ranking

## Understanding Results

### Result Information

Each result shows:
- **Title** - Content name/headline
- **Source** - Where it's from (YouTube, GitHub, etc.)
- **Type** - Format (video, repo, article, profile, channel, etc.)
- **AI Explanation** (when AI mode is ON) - Why it's relevant for YOUR query
- **AI Score** - How well it matches your needs (1-10)

### Types of Content

| Type | Source | What It Is |
|------|--------|-----------|
| `video` | YouTube | Tutorial, talk, course |
| `channel` | YouTube | YouTube channel |
| `repo` | GitHub | Code repository |
| `profile` | GitHub | Developer profile |
| `article` | Medium/Dev.to | Blog post, technical article |
| `post` | Reddit | Community discussion |

## Troubleshooting

### "No results found"

Try:
1. Check spelling of usernames
2. Use generic search instead (without @)
3. Remove specialized context, use broader terms
4. Try different providers

### "Results don't match my style"

Try:
1. Add more detailed personalization context
2. Re-run search with better context
3. Try different keywords

### "AI not re-ranking results"

Ensure:
1. AI Search mode is ON (button is purple/highlighted)
2. Wait 2-3 seconds for AI to process
3. Check that AI provider is configured (Gemini or OpenRouter)
4. Try shorter queries for faster processing

## FAQ

**Q: Do I need to enable AI Search for everything?**
A: No! Regular search works great too. AI Search adds personalization and better ranking.

**Q: Can I search for multiple types?**
A: Yes! You can still do generic searches with AI - it'll return all types and AI will re-rank.

**Q: How accurate are the results?**
A: Very! AI detection is ~95% accurate. If a query is ambiguous, it defaults to generic search.

**Q: Is my personalization context saved?**
A: No, it's only used for this search. Add it again if you want the same preferences next time.

**Q: Can I search for specific websites?**
A: Yes! Use site-specific queries like `"site:github.com machine learning"`

## Next Steps

1. ✅ Try searching for a GitHub user: `@torvalds`
2. ✅ Try a YouTube channel: `@LinusTechTips`
3. ✅ Try a topic with AI: `machine learning` + your learning preference
4. ✅ Mix and match providers using the filter buttons

---

**Happy searching!** 🚀

For technical details, see `AI_SEARCH_GUIDE.md`
