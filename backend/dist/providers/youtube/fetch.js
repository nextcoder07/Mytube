"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchYouTubeVideo = fetchYouTubeVideo;
const normalize_1 = require("./normalize");
async function fetchYouTubeVideo(videoId) {
    const apiKey = process.env.MYTUBE_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
    if (!apiKey || apiKey.includes('your-') || apiKey === 'AIzaSy...')
        return null;
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok)
        return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item)
        return null;
    return (0, normalize_1.normalizeVideo)(item);
}
//# sourceMappingURL=fetch.js.map