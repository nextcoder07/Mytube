# 🚀 DEPLOYMENT GUIDE

## Pre-Deployment Checklist

- [ ] Review FINAL_SUMMARY.md
- [ ] Review CODE_CHANGES_REFERENCE.md
- [ ] Verify all documentation files exist
- [ ] Backend code pulled to local machine
- [ ] TypeScript build passes: `npm run build` ✅
- [ ] Test script available: `test-search.ps1`

## Deployment Steps

### Step 1: Backup (Optional but Recommended)
```bash
# Backup current backend
git stash
# or
cp -r backend backend.backup
```

### Step 2: Pull Latest Code
```bash
git pull origin main
# or just the backend if needed
cd backend
git pull origin main
```

### Step 3: Verify Build
```bash
cd backend
npm install  # If needed
npm run build
```

Expected output:
```
> tsc
(no errors)
✅ BUILD SUCCESSFUL
```

### Step 4: Stop Current Server
```bash
# If running in terminal, press Ctrl+C
# Or if running as a service:
systemctl stop mytube-backend
# or
pm2 stop mytube-backend
```

### Step 5: Start New Server
```bash
cd backend
npm start
# or
npm run dev  # if development mode
```

Expected logs:
```
[SearchService] Initialized
listening on port 3000
```

### Step 6: Initial Verification
```bash
# In a new terminal, run test script
cd backend
.\test-search.ps1 -Query "cars"
```

Expected results:
- 140 total results
- Breakdown by source showing all providers
- Mix of YouTube, GitHub, Reddit, Medium, Dev.to, Wikipedia

### Step 7: Production Verification
```bash
# Test in browser/frontend
1. Go to search page
2. Search: "cars"
3. Look for results from multiple providers
4. Should NOT be all GitHub

# Test specialized search
1. Search: "@torvalds"
2. Should show GitHub profile + repos

# Test AI search (if enabled)
1. Enable "AI Search"
2. Add context: "learning"
3. Search: "machine learning"
4. Should show tutorials, docs, courses
```

### Step 8: Monitor Logs
```bash
# Watch for provider breakdown
tail -f server.log | grep "breakdown by source"

# Expected: All providers represented
# NOT: One provider dominating
```

## Rollback Plan

If something goes wrong:

### Option 1: Quick Rollback
```bash
# If you made a git stash
git stash pop

# or if you made a backup
rm -rf backend
mv backend.backup backend
```

### Option 2: Revert to Previous Build
```bash
git revert HEAD
npm run build
npm start
```

### Option 3: Manual Rollback
Restore these files to previous version:
- `backend/src/services/search.service.ts`
- `backend/src/providers/youtube/index.ts`
- `backend/src/models/content.model.ts`

## Health Checks After Deployment

### Automated Check
```bash
.\test-search.ps1 -Query "cars"
```

### Manual Checks
1. **Provider Breakdown Check**
   ```
   Look for log: [SearchService.search] breakdown by source
   Should show: youtube: X, github: Y, reddit: Z, etc.
   NOT: Only github with no other sources
   ```

2. **YouTube Check**
   ```
   Search: "youtube"
   Expected: YouTube results visible
   NOT: Empty or only GitHub results
   ```

3. **Pattern Detection Check**
   ```
   Search: "@octocat"
   Expected: GitHub profile (not generic search)
   Verify: Pattern recognized correctly
   ```

4. **Performance Check**
   ```
   Measure search response time
   Expected: 3-8 seconds for generic search
   NOT: Significantly slower than before
   ```

## Monitoring After Deployment

### Key Metrics to Watch
1. **Search Response Time**
   - Generic search: 3-8 seconds
   - AI search: 5-10 seconds
   - Alert if > 15 seconds

2. **Provider Distribution**
   - YouTube: 15-20%
   - GitHub: 12-18%
   - Reddit: 10-15%
   - Medium: 8-12%
   - Dev.to: 5-10%
   - Wikipedia: 2-5%
   - Website: 5-8%
   - Alert if any > 40%

3. **Error Rates**
   - YouTube API failures: OK (has fallback)
   - Other provider failures: < 1%
   - Search errors: < 1%

4. **Log Patterns**
   - `[SearchService]` - Search operation logs
   - `[YouTube]` - YouTube provider logs
   - `breakdown by source:` - Provider distribution

### Log Examples

#### ✅ Good Log Output
```
[SearchService.search] breakdown by source: { 
  youtube: 24, 
  github: 18, 
  reddit: 14, 
  medium: 10, 
  website: 8, 
  devto: 5, 
  wikipedia: 3 
}
[YouTube] Channel search for "@torvalds" returned 8 results
[SearchService.searchAI] Using all providers for generic query
```

#### ❌ Bad Log Output (Indicates Issue)
```
[SearchService.search] breakdown by source: { 
  github: 140, 
  youtube: 0 
}
[YouTube] API search error: 403 Forbidden (not falling back)
Only 1 provider used instead of 7
```

### How to Check Logs

#### For Node.js Running in Terminal
```bash
# Logs appear in terminal directly
# Look for provider breakdown output
```

#### For Node.js Running as Service
```bash
# View logs
tail -f /var/log/mytube-backend.log

# Or if using pm2:
pm2 logs mytube-backend
```

#### For Docker Container
```bash
# View logs
docker logs -f mytube-backend

# Or with tail
docker logs mytube-backend | tail -f
```

## Verification Timeline

| Time | Check | Expected Result |
|------|-------|-----------------|
| Immediately | Build completes | ✅ No errors |
| +5 min | Server starts | ✅ Listening on port 3000 |
| +30 sec | Test script runs | ✅ 140 results, mixed providers |
| +1 min | Browser search | ✅ Results visible (YouTube + GitHub) |
| +5 min | Check logs | ✅ Provider breakdown logged |
| +10 min | Monitor performance | ✅ 3-8 second response time |

## Success Criteria

✅ **Deployment successful if all true:**
- [ ] Build completed without errors
- [ ] Server started on port 3000
- [ ] Search test returned 140+ results
- [ ] Results include YouTube results
- [ ] Results include multiple providers
- [ ] Not dominated by single provider (< 50% for any provider)
- [ ] Response time 3-8 seconds
- [ ] Logs show all 7 providers in breakdown
- [ ] Browser tests pass (mix of YouTube/GitHub/Reddit)
- [ ] No errors in server logs

## Contact & Support

### If something breaks:
1. Check server logs for errors
2. Review CODE_CHANGES_REFERENCE.md
3. See TROUBLESHOOTING in FIXES_VERIFIED.md
4. Rollback if needed

### If results still not balanced:
1. Verify all 7 providers in logs
2. Check if AI search is forcing all providers
3. Verify provider balancing function runs
4. Check if fallbacks are working

### If performance is slow:
1. Check network connections
2. Monitor API rate limits
3. Check server resources
4. See performance section in SUMMARY_SEARCH_FIX.md

## Post-Deployment Communication

### Announcement
```
✅ DEPLOYMENT COMPLETE

Search system has been improved:
- Better results from all providers (YouTube, GitHub, Reddit, Medium, Dev.to, Wikipedia)
- Smarter search that understands your intent
- Balanced, diverse results instead of one provider dominating
- Graceful handling of provider failures
- Faster, more relevant results

Try searching "cars" or "@yourname" to see the improvements!
```

### What to Tell Users
- "Search is now smarter and more balanced"
- "YouTube results should appear now"
- "GitHub is no longer dominating all results"
- "Search understands what you're looking for"
- "Results are from all providers"

---

## 📋 Final Deployment Checklist

### Pre-Deployment
- [ ] Reviewed FINAL_SUMMARY.md
- [ ] Reviewed CODE_CHANGES_REFERENCE.md
- [ ] Build passes without errors
- [ ] Test script works locally
- [ ] Backup created (if rollback needed)

### Deployment
- [ ] Pulled latest code
- [ ] Ran `npm run build` successfully
- [ ] Stopped old server
- [ ] Started new server
- [ ] Initial verification passed

### Post-Deployment
- [ ] Test script verified (140 results, mixed providers)
- [ ] Browser tested (mix of YouTube, GitHub, Reddit)
- [ ] Logs checked (provider breakdown shown)
- [ ] Performance verified (3-8 seconds)
- [ ] Monitoring set up
- [ ] Team notified of deployment

---

**Status: Ready to Deploy** ✅

All code changes complete, tested, and documented.
Deployment steps clear and rollback plan available.
Proceed with confidence! 🚀
