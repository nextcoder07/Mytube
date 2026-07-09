'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/player/GlobalPlayer.tsx
import React, { useState, useMemo } from "react";
import { usePlayerStore } from "../../store/player.store";
import { useAuth } from "../../hooks/useAuth";
import api from "../../lib/api";
import {
  XMarkIcon,
  MinusSmallIcon,
  ArrowsPointingOutIcon,
  SparklesIcon,
  DocumentPlusIcon,
  BookmarkIcon,
  PlayIcon,
  ClockIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import ContentDetail from "../content/ContentDetail";
import type { Content } from "../../types/content";

// ─── Shared mini card used in horizontal rows ────────────────────────────────
function MiniCard({ item, onClick, badge }: { item: Content; onClick: () => void; badge?: string }) {
  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-44 sm:w-52 cursor-pointer group"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800 mb-2">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayIcon className="w-8 h-8 text-gray-600" />
          </div>
        )}
        {badge && (
          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-black/70 text-violet-300 border border-violet-500/30">
            {badge}
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white/0 group-hover:bg-white/20 transition-all flex items-center justify-center">
            <PlayIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-200 group-hover:text-violet-400 line-clamp-2 leading-snug">
        {item.title}
      </p>
      <p className="text-[11px] text-gray-500 mt-0.5 truncate">{item.author || item.source}</p>
    </div>
  );
}

// ─── Horizontal scroll row with section label ─────────────────────────────────
function HScrollRow({
  title,
  items,
  onPlay,
  badge,
  accent = "violet",
  emptyText,
}: {
  title: string;
  items: Content[];
  onPlay: (item: Content) => void;
  badge?: string;
  accent?: "violet" | "fuchsia" | "indigo" | "cyan";
  emptyText?: string;
}) {
  const accentClasses: Record<string, string> = {
    violet: "text-violet-400 border-violet-500/40",
    fuchsia: "text-fuchsia-400 border-fuchsia-500/40",
    indigo: "text-indigo-400 border-indigo-500/40",
    cyan: "text-cyan-400 border-cyan-500/40",
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-4 border-b border-gray-800/60">
      <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 border-l-2 pl-2 ${accentClasses[accent]}`}>
        {title}
      </h2>
      {items.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {items.map((item) => (
            <MiniCard key={item.id} item={item} onClick={() => onPlay(item)} badge={badge} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-600 italic pl-2">{emptyText || "Nothing here yet."}</p>
      )}
    </div>
  );
}


// ─── YouTube-style vertical sidebar card ─────────────────────────────────────
function SidebarMiniCard({ item, onClick }: { item: Content; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex gap-3 p-2 rounded-xl hover:bg-gray-800/60 cursor-pointer group transition-colors"
    >
      {/* Responsive thumbnail: larger on mobile, tighter on desktop */}
      <div className="relative w-32 min-[400px]:w-40 sm:w-44 lg:w-36 xl:w-40 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayIcon className="w-6 h-6 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <h4 className="text-xs font-semibold text-gray-200 group-hover:text-violet-400 line-clamp-2 leading-snug">
          {item.title}
        </h4>
        <p className="text-[11px] text-gray-500 mt-1 truncate">{item.author || item.source}</p>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">{item.source}</span>
      </div>
    </div>
  );
}

// ─── Persistent YouTube Embed ────────────────────────────────────────────────
// This component uses instanceId as key so it only remounts when content changes,
// NOT on minimize/maximize.
function YouTubeEmbed({
  videoId,
  instanceId,
  className,
}: {
  videoId: string;
  instanceId: string;
  className?: string;
}) {
  return (
    <iframe
      key={instanceId}
      className={className || "w-full h-full"}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

// ─── Main GlobalPlayer ────────────────────────────────────────────────────────
export default function GlobalPlayer() {
  const {
    activeContent,
    isMinimized,
    minimize,
    maximize,
    closePlayer,
    play,
    history,
    watchLater,
    goBackVideo,
    toggleWatchLater,
    instanceId,
  } = usePlayerStore();
  const { isAuthenticated } = useAuth();
  const [showSummary, setShowSummary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  // Dynamic related content state
  const [relatedContent, setRelatedContent] = useState<Content[]>([]);
  const [isFetchingRelated, setIsFetchingRelated] = useState(false);

  // Fetch related content when activeContent changes
  React.useEffect(() => {
    if (!activeContent) return;
    let isMounted = true;
    
    async function fetchRelated() {
      setIsFetchingRelated(true);
      try {
        const query = activeContent!.title.replace(/[^\w\s]/gi, ' ').trim();
        const goal = localStorage.getItem("mytube_ai_context") || "";
        const res = await api.get("/search", { 
          params: { q: query, limit: 12, aiContext: goal }
        });
        
        if (isMounted) {
          const filtered = (res.data.data as Content[]).filter(c => c.id !== activeContent!.id);
          setRelatedContent(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch related content", err);
      } finally {
        if (isMounted) setIsFetchingRelated(false);
      }
    }
    
    fetchRelated();
    return () => { isMounted = false; };
  }, [activeContent?.id]);

  const handleSaveToPlaylist = async () => {
    if (!activeContent) return;
    if (!isAuthenticated) { setSaveStatus("Please sign in to save content to a playlist."); return; }
    setSaveStatus("Saving to playlist...");
    try {
      const playlistResponse = await api.get("/playlist");
      const playlists = playlistResponse.data.data as Array<{ id: string; title: string }>;
      let savedPlaylist = playlists.find((p) => p.title === "Saved Videos");
      if (!savedPlaylist) {
        const createResponse = await api.post("/playlist", { title: "Saved Videos", description: "Saved from MyTube", isPublic: false });
        savedPlaylist = createResponse.data.data;
      }
      if (!savedPlaylist?.id) throw new Error("Failed to resolve or create playlist");
      await api.post(`/playlist/${savedPlaylist.id}/items`, { contentId: activeContent.id });
      setSaveStatus(`Saved to "${savedPlaylist.title}"`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save to playlist.";
      setSaveStatus(message);
    }
    window.setTimeout(() => setSaveStatus(null), 3000);
  };

  // ── YouTube helper ────────────────────────────────────────────────────────
  const getYoutubeVideoId = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    } catch { return null; }
    return null;
  };

  // Memoize so it doesn't recalculate on every render
  const isYouTube = activeContent?.source === "youtube";
  const videoId = useMemo(
    () => (isYouTube && activeContent ? getYoutubeVideoId(activeContent.url) : null),
    [activeContent?.url, isYouTube]
  );

  // Check if current item is in Watch Later
  const isInWatchLater = activeContent
    ? watchLater.some((c) => c.id === activeContent.id)
    : false;

  // "Previously Watched" — deduplicated from history, most recent first, exclude current
  const previouslyWatched = useMemo(() => {
    if (!activeContent) return [];
    const seen = new Set<string>();
    const result: Content[] = [];
    // history is oldest → newest; reverse to get most recent first
    for (let i = history.length - 1; i >= 0; i--) {
      const item = history[i];
      if (item.id !== activeContent.id && !seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }
    return result;
  }, [history, activeContent?.id]);

  // "Watch Later" — exclude currently playing
  const watchLaterFiltered = useMemo(() => {
    if (!activeContent) return watchLater;
    return watchLater.filter((c) => c.id !== activeContent.id);
  }, [watchLater, activeContent?.id]);

  if (!activeContent) return null;

  // ── Build the iframe/content element ONCE, and reuse it ──────────────────
  const playerContent = isYouTube && videoId ? (
    <YouTubeEmbed
      videoId={videoId}
      instanceId={instanceId || `yt-${videoId}`}
      className="w-full h-full"
    />
  ) : (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white select-none">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
        {activeContent.thumbnail ? (
          <img src={activeContent.thumbnail} alt={activeContent.title} className="w-32 h-32 mx-auto rounded-2xl object-cover border border-slate-800 shadow-xl" />
        ) : (
          <div className="w-24 h-24 mx-auto rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <SparklesIcon className="w-12 h-12" />
          </div>
        )}
        <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[11px] font-bold uppercase tracking-wider">{activeContent.source}</span>
        <h3 className="text-xl md:text-2xl font-extrabold line-clamp-2 leading-tight">{activeContent.title}</h3>
        <a href={activeContent.url} target="_blank" rel="noopener noreferrer"
          className="w-full max-w-sm mx-auto py-3 px-6 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-violet-600/25">
          Open in New Tab
        </a>
      </div>
    </div>
  );

  // ─── PIP / Minimized ─────────────────────────────────────────────────────
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-80 shadow-2xl rounded-xl overflow-hidden z-50 bg-gray-950 border border-gray-800 animate-in slide-in-from-bottom-5">
        <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-800">
          <p className="text-xs font-semibold text-gray-300 truncate pr-2">{activeContent.title}</p>
          <div className="flex gap-1">
            <button onClick={maximize} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
              <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
            <button onClick={closePlayer} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-red-400 transition-colors">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="aspect-video bg-black">
          {playerContent}
        </div>
      </div>
    );
  }

  // ─── Maximized (Full Width Layout with YouTube-style Sidebar) ──────────────────
  return (
    <div className="flex-1 w-full h-full bg-gray-900 flex flex-col overflow-y-auto animate-in fade-in duration-200">
      
      {/* Top Navigation Bar inside Player */}
      <div className="w-full bg-black border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button onClick={goBackVideo} className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors">
          <span className="text-lg leading-none">&larr;</span> 
          {history.length > 0 ? "Back to Previous Video" : "Back to Search Results"}
        </button>
        <div className="flex gap-2">
          <button onClick={minimize} className="p-1.5 bg-gray-800/50 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors" title="Minimize Player (Picture in Picture)">
            <MinusSmallIcon className="w-5 h-5" />
          </button>
          <button onClick={closePlayer} className="p-1.5 bg-gray-800/50 hover:bg-red-500/20 rounded-lg text-gray-300 hover:text-red-400 transition-colors" title="Close Player">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Video + Details + Watch Later/History.
          Right is Vertical "More Like This" — on mobile, it flows below */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto w-full pb-20">
        {/* Left Pane (8 Columns on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Player embed - Aspect Video */}
          <div className="w-full bg-black aspect-video rounded-2xl overflow-hidden relative shadow-2xl border border-gray-800">
            {playerContent}
          </div>

          {/* Content Info & Actions */}
          <div className="bg-gray-950/20 border border-gray-800/80 rounded-2xl p-5 md:p-6 space-y-4">
            <h1 className="text-lg md:text-xl lg:text-2xl font-extrabold text-white leading-tight">{activeContent.title}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-900">
              <div className="flex items-center gap-3 text-xs md:text-sm text-gray-400 font-medium">
                <span className="text-gray-300 font-semibold">{activeContent.author || "Unknown Author"}</span>
                {activeContent.viewCount !== undefined && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                    <span>{activeContent.viewCount.toLocaleString()} views</span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowSummary(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-violet-400 hover:text-white rounded-xl text-xs font-semibold transition-colors">
                  <SparklesIcon className="w-4 h-4" /> AI Summarize
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/20 text-pink-400 hover:text-white rounded-xl text-xs font-semibold transition-colors">
                  <DocumentPlusIcon className="w-4 h-4" /> Note
                </button>
                {/* Watch Later toggle button */}
                <button
                  onClick={() => toggleWatchLater(activeContent)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                    isInWatchLater
                      ? "bg-cyan-600/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-600/30 hover:text-cyan-300"
                      : "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {isInWatchLater ? (
                    <><CheckIcon className="w-4 h-4" /> In Watch Later</>
                  ) : (
                    <><ClockIcon className="w-4 h-4" /> Watch Later</>
                  )}
                </button>
                <button onClick={handleSaveToPlaylist}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800 text-gray-200 hover:text-white rounded-xl text-xs font-semibold transition-colors border border-gray-700">
                  <BookmarkIcon className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
            {saveStatus && <div className="text-xs text-violet-400 font-medium">{saveStatus}</div>}
            {activeContent.description && (
              <div className="p-4 bg-gray-850/40 rounded-xl border border-gray-800 text-xs md:text-sm text-gray-400 leading-relaxed max-w-none">
                {activeContent.description}
              </div>
            )}
          </div>

          {/* Watch Later & Previously Watched Rows */}
          <div className="space-y-4">
            <HScrollRow
              title="🕐 Watch Later"
              items={watchLaterFiltered}
              onPlay={play}
              accent="cyan"
              emptyText="Add items to your Watch Later list using the clock button above."
            />

            <HScrollRow
              title="⏮ Previously Watched"
              items={previouslyWatched}
              onPlay={play}
              badge="watched"
              accent="indigo"
              emptyText="Your viewing history will appear here."
            />
          </div>
        </div>

        {/* Right Pane: Vertical YouTube-style "More Like This"
            On mobile (< lg), this naturally flows below all content.
            On desktop (lg+), it sits in the right 4 columns. */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 border-l-2 border-fuchsia-500/40 pl-2 flex items-center gap-1.5">
            <SparklesIcon className="w-4 h-4 animate-pulse" />
            More Like This
          </h2>
          
          {isFetchingRelated ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 p-2 animate-pulse">
                  <div className="w-32 min-[400px]:w-40 sm:w-44 lg:w-36 xl:w-40 aspect-video bg-gray-800/50 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-800/50 rounded w-5/6" />
                    <div className="h-3 bg-gray-800/50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : relatedContent.length > 0 ? (
            <div className="flex flex-col gap-2 divide-y divide-gray-800/40 lg:max-h-[85vh] lg:overflow-y-auto lg:pr-1">
              {relatedContent.map((item) => (
                <SidebarMiniCard key={item.id} item={item} onClick={() => play(item)} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs italic pl-2">No deeply related content found based on your goals.</p>
          )}
        </div>
      </div>

      {/* AI Summary Modal */}
      {showSummary && (
        <ContentDetail contentId={activeContent.id} onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
}
