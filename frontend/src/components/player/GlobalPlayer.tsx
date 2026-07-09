'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/player/GlobalPlayer.tsx
import React, { useState } from "react";
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
}: {
  title: string;
  items: Content[];
  onPlay: (item: Content) => void;
  badge?: string;
  accent?: "violet" | "fuchsia" | "indigo";
}) {
  if (items.length === 0) return null;

  const accentClasses: Record<string, string> = {
    violet: "text-violet-400 border-violet-500/40",
    fuchsia: "text-fuchsia-400 border-fuchsia-500/40",
    indigo: "text-indigo-400 border-indigo-500/40",
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-4 border-b border-gray-800/60">
      <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 border-l-2 pl-2 ${accentClasses[accent]}`}>
        {title}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {items.map((item) => (
          <MiniCard key={item.id} item={item} onClick={() => onPlay(item)} badge={badge} />
        ))}
      </div>
    </div>
  );
}

// ─── Stacked vertical card (for desktop sidebar) ──────────────────────────────
function SidebarCard({ item, isActive, onClick }: { item: Content; isActive: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex gap-3 p-2 rounded-xl cursor-pointer group transition-colors ${
        isActive
          ? "bg-violet-600/15 border border-violet-500/25"
          : "hover:bg-gray-800/70 border border-transparent"
      }`}
    >
      <div className="relative w-28 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-gray-800">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayIcon className="w-5 h-5 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center overflow-hidden min-w-0">
        <p className={`text-xs font-semibold line-clamp-2 leading-snug ${isActive ? "text-violet-300" : "text-gray-200 group-hover:text-white"}`}>
          {item.title}
        </p>
        <p className="text-[11px] text-gray-500 mt-1 truncate">{item.author || item.source}</p>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">{item.source}</span>
      </div>
    </div>
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
    queue,
    play,
  } = usePlayerStore();
  const { isAuthenticated } = useAuth();
  const [showSummary, setShowSummary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

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

  if (!activeContent) return null;

  // ── Derive queue partitions ──────────────────────────────────────────────
  const currentIndex = queue.findIndex((c) => c.id === activeContent.id);
  const prevItems = currentIndex > 0 ? queue.slice(0, currentIndex) : [];
  const nextItems = currentIndex !== -1 ? queue.slice(currentIndex + 1) : queue;
  // Top 6 of next for the "Up Next" row; rest go below
  const nextRowItems = nextItems.slice(0, 8);
  const moreItems = nextItems.slice(8);

  // ── YouTube helper ────────────────────────────────────────────────────────
  const getYoutubeVideoId = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    } catch { return null; }
    return null;
  };

  const isYouTube = activeContent.source === "youtube";
  const videoId = isYouTube ? getYoutubeVideoId(activeContent.url) : null;

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
          {isYouTube && videoId ? (
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-950 text-gray-400 text-xs p-4 text-center">
              {activeContent.title}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Maximized ───────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full h-full bg-gray-900 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden animate-in fade-in duration-200">

      {/* ── LEFT: Main player + rows ── */}
      <div className="flex-1 flex flex-col xl:overflow-y-auto min-w-0">

        {/* Player embed */}
        <div className="w-full bg-black aspect-video xl:max-h-[65vh] flex items-center justify-center relative shadow-xl flex-shrink-0">
          {/* Controls overlay */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button onClick={minimize} className="p-1.5 bg-black/50 hover:bg-black/80 rounded-lg text-white backdrop-blur-sm transition-colors border border-white/10" title="Minimize">
              <MinusSmallIcon className="w-4 h-4" />
            </button>
            <button onClick={closePlayer} className="p-1.5 bg-black/50 hover:bg-black/80 rounded-lg text-white backdrop-blur-sm transition-colors border border-white/10" title="Close">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {isYouTube && videoId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white select-none">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                {activeContent.thumbnail ? (
                  <img src={activeContent.thumbnail} alt={activeContent.title} className="w-24 h-24 mx-auto rounded-xl object-cover border border-slate-800 shadow" />
                ) : (
                  <div className="w-20 h-20 mx-auto rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <SparklesIcon className="w-10 h-10" />
                  </div>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-bold uppercase tracking-wider">{activeContent.source}</span>
                <h3 className="text-base font-extrabold line-clamp-2">{activeContent.title}</h3>
                <a href={activeContent.url} target="_blank" rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all">
                  Open in New Tab
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Info & Actions */}
        <div className="p-4 md:p-6 lg:px-8 border-b border-gray-800">
          <h1 className="text-lg md:text-xl font-bold text-white mb-3">{activeContent.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-400 font-medium">
              <span>{activeContent.author || "Unknown Author"}</span>
              {activeContent.viewCount !== undefined && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>{activeContent.viewCount.toLocaleString()} views</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowSummary(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-violet-400 hover:text-white rounded-lg text-xs font-semibold transition-colors">
                <SparklesIcon className="w-3.5 h-3.5" /> AI Summarize
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/20 text-pink-400 hover:text-white rounded-lg text-xs font-semibold transition-colors">
                <DocumentPlusIcon className="w-3.5 h-3.5" /> Note
              </button>
              <button onClick={handleSaveToPlaylist}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-gray-700">
                <BookmarkIcon className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>
          {saveStatus && <div className="mt-2 text-xs text-gray-400">{saveStatus}</div>}
          {activeContent.description && (
            <div className="mt-4 p-3 bg-gray-800/40 rounded-xl border border-gray-800 text-sm text-gray-400 leading-relaxed line-clamp-3">
              {activeContent.description}
            </div>
          )}
        </div>

        {/* ── ROW 1: Previous videos (horizontal scroll) ── */}
        <HScrollRow
          title="⏮ Previously"
          items={prevItems}
          onPlay={play}
          badge="prev"
          accent="indigo"
        />

        {/* ── ROW 2: Up Next (horizontal scroll) ── */}
        <HScrollRow
          title="▶ Up Next"
          items={nextRowItems}
          onPlay={play}
          accent="violet"
        />

        {/* ── ROW 3: More related items (hidden on xl where sidebar shows them) ── */}
        {moreItems.length > 0 && (
          <div className="px-4 md:px-6 lg:px-8 py-4 xl:hidden">
            <h2 className="text-xs font-bold uppercase tracking-widest text-fuchsia-400 border-l-2 border-fuchsia-500/40 pl-2 mb-3">
              More Related
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {moreItems.map((item) => (
                <MiniCard key={item.id} item={item} onClick={() => play(item)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT SIDEBAR: Desktop only (xl+) — all related/queue items ── */}
      <div className="hidden xl:flex w-[340px] flex-shrink-0 flex-col border-l border-gray-800 bg-gray-950 xl:h-full xl:overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Related &amp; Suggested</h3>
          <p className="text-xs text-gray-500 mt-0.5">{queue.length - 1} items in queue</p>
        </div>

        {/* All queue items as vertical stacked list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {queue.filter((q) => q.id !== activeContent.id).map((item) => (
            <SidebarCard
              key={item.id}
              item={item}
              isActive={false}
              onClick={() => play(item)}
            />
          ))}
          {queue.length <= 1 && (
            <div className="text-center py-12 text-gray-600 text-xs">
              No related items yet.<br />Search for more content.
            </div>
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
