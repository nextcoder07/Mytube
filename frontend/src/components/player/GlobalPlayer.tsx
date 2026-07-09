'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/player/GlobalPlayer.tsx
import React, { useState, useEffect } from "react";
import { usePlayerStore } from "../../store/player.store";
import { useSearchStore } from "../../store/search.store";
import { useAuth } from "../../hooks/useAuth";
import api from "../../lib/api";
import type { Content } from "../../types/content";
import {
  XMarkIcon,
  MinusSmallIcon,
  ArrowsPointingOutIcon,
  SparklesIcon,
  DocumentPlusIcon,
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import ContentDetail from "../content/ContentDetail";

export default function GlobalPlayer() {
  const {
    activeContent,
    isMinimized,
    minimize,
    maximize,
    closePlayer,
    queue,
    next,
    previous,
    play
  } = usePlayerStore();
  const { isAuthenticated } = useAuth();
  const [showSummary, setShowSummary] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [watchBefore, setWatchBefore] = useState<Content[]>([]);
  const [watchAfter, setWatchAfter] = useState<Content[]>([]);
  const [relatedList, setRelatedList] = useState<Content[]>([]);
  const [relatedLimit, setRelatedLimit] = useState(50);
  const searchStore = useSearchStore();

  const handleSaveToPlaylist = async () => {
    if (!activeContent) return;

    if (!isAuthenticated) {
      setSaveStatus("Please sign in to save content to a playlist.");
      return;
    }

    setSaveStatus("Saving to playlist...");
    try {
      const playlistResponse = await api.get("/playlist");
      const playlists = playlistResponse.data.data as Array<{ id: string; title: string }>;
      let savedPlaylist = playlists.find((playlist) => playlist.title === "Saved Videos");

      if (!savedPlaylist) {
        const createResponse = await api.post("/playlist", {
          title: "Saved Videos",
          description: "Saved from MyTube",
          isPublic: false,
        });
        savedPlaylist = createResponse.data.data;
      }

      if (!savedPlaylist?.id) {
        throw new Error("Failed to resolve or create playlist");
      }

      await api.post(`/playlist/${savedPlaylist.id}/items`, {
        contentId: activeContent.id,
      });
      setSaveStatus(`Saved to "${savedPlaylist.title}"`);
    } catch (err) {
      console.error("Save playlist error:", err);
      const message = err instanceof Error ? err.message : "Failed to save to playlist.";
      setSaveStatus(message);
    }

    window.setTimeout(() => setSaveStatus(null), 3000);
  };


  // Extract YouTube ID for embedding
  const getYoutubeVideoId = (url: string) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        return urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        return urlObj.pathname.slice(1);
      }
    } catch {
      return null;
    }
    return null;
  };

  


  useEffect(() => {
    let mounted = true;
    async function fetchSuggestions() {
      if (!activeContent) return;
      const userQuery = searchStore.params?.q || '';

      try {
        const beforeRes = await api.get('/search/suggestions/before', { params: { q: userQuery, contentTitle: activeContent.title, providers: 'youtube', limit: 20 } });
        if (!mounted) return;
        setWatchBefore((beforeRes.data?.data as Content[]) || []);

        const afterRes = await api.get('/search/suggestions/after', { params: { q: userQuery, contentTitle: activeContent.title, providers: 'youtube', limit: 20 } });
        if (!mounted) return;
        setWatchAfter((afterRes.data?.data as Content[]) || []);

        // Related list: combined search term + current playing context + goal
        const relatedQueryParts = [userQuery, activeContent.title, searchStore.params?.order].filter(Boolean).join(' ');
        const relatedRes = await api.get('/search', { params: { q: relatedQueryParts || activeContent.title, providers: 'youtube', limit: relatedLimit } });
        if (!mounted) return;
        setRelatedList((relatedRes.data?.data as Content[]) || []);
      } catch (err) {
        console.warn('Failed to fetch player suggestions', err);
      }
    }
    fetchSuggestions();
    return () => { mounted = false; };
  }, [activeContent, activeContent?.id, relatedLimit, searchStore.params?.q, searchStore.params?.order]);

  if (!activeContent) return null;

  const isYouTube = activeContent.source === 'youtube';
  const videoId = isYouTube ? getYoutubeVideoId(activeContent.url) : null;

  return (
    <div className={isMinimized ? "fixed bottom-4 right-4 w-80 shadow-2xl rounded-xl overflow-hidden z-50 bg-gray-950 border border-gray-800 animate-in slide-in-from-bottom-5" : "flex-1 w-full h-full bg-gray-900 flex flex-col xl:flex-row overflow-y-auto xl:overflow-hidden animate-in fade-in duration-200"}>

      {/* Left/Main Section for Maximized OR PIP wrapper for Minimized */}
      <div className={isMinimized ? "w-full flex flex-col" : "flex-1 flex flex-col xl:overflow-y-auto"}>

        {/* PIP Header */}
        {isMinimized && (
          <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-800">
            <p className="text-xs font-semibold text-gray-300 truncate pr-2">
              {activeContent.title}
            </p>
            <div className="flex gap-1">
              <button onClick={maximize} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
                <ArrowsPointingOutIcon className="w-4 h-4" />
              </button>
              <button onClick={closePlayer} className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-red-400 transition-colors">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Media Player Area */}
        <div className={isMinimized ? "aspect-video bg-black flex items-center justify-center relative" : "w-full bg-black aspect-video xl:max-h-[70vh] flex items-center justify-center relative shadow-xl"}>
          {/* Controls Overlay */}
          {!isMinimized && (
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button onClick={minimize} className="p-2 bg-black/50 hover:bg-black/80 rounded-lg text-white backdrop-blur-sm transition-colors border border-white/10" title="Minimize">
                <MinusSmallIcon className="w-5 h-5" />
              </button>
              <button onClick={closePlayer} className="p-2 bg-black/50 hover:bg-black/80 rounded-lg text-white backdrop-blur-sm transition-colors border border-white/10" title="Close">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Player Embed */}
          {isYouTube && videoId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-950 text-white select-none">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
                <div className="flex justify-center">
                  {activeContent.thumbnail ? (
                    <img
                      src={activeContent.thumbnail}
                      alt={activeContent.title}
                      className="w-24 h-24 rounded-xl object-cover border border-slate-800 shadow"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                      <SparklesIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-bold uppercase tracking-wider">
                    {activeContent.source}
                  </span>
                  <h3 className="text-base font-extrabold line-clamp-2">{activeContent.title}</h3>
                  <p className="text-xs text-gray-400 font-medium">By {activeContent.author || "Unknown Author"}</p>
                </div>

                {activeContent.description && (
                  <p className="text-xs text-gray-500 line-clamp-3 leading-normal">
                    {activeContent.description}
                  </p>
                )}

                <div className="pt-2">
                  <a
                    href={activeContent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/15"
                  >
                    Open Resource in New Tab
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info & Actions Bar */}
        {!isMinimized && (
          <>
            <div className="p-4 md:p-6 lg:px-8 border-b border-gray-800">
              <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{activeContent.title}</h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                {/* Author & Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                  <span>{activeContent.author || "Unknown Author"}</span>
                  {activeContent.viewCount !== undefined && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                      <span>{activeContent.viewCount.toLocaleString()} views</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowSummary(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 text-violet-400 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    AI Summarize
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/20 text-pink-400 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <DocumentPlusIcon className="w-4 h-4" />
                    Note
                  </button>
                  <button
                    onClick={handleSaveToPlaylist}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-colors border border-gray-700"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

              {saveStatus && (
                <div className="mt-3 text-sm text-gray-300">
                  {saveStatus}
                </div>
              )}

              <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-800 text-sm text-gray-300 leading-relaxed">
                {activeContent.description}
              </div>
              {/* Suggestion rows: Watch Before, Watch After, Related list */}
              <div className="mt-6 space-y-6">
                {/* Watch Before */}
                {watchBefore.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200 mb-2">Watch Before</h4>
                    <div className="flex gap-3 overflow-x-auto py-2">
                      {watchBefore.map((item) => (
                        <div key={`before-${item.id}`} className="w-20 flex-shrink-0 cursor-pointer" onClick={() => play(item, [item, ...queue])}>
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
                            {item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700" />}
                          </div>
                          <p className="mt-1 text-xs font-semibold text-gray-200 line-clamp-2">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={(e) => { e.stopPropagation(); play(item, [item, ...queue]); }} className="text-xs text-violet-400">Play</button>
                            <button onClick={(e) => { e.stopPropagation(); play(activeContent, [...queue, item]); }} className="text-xs text-gray-400">Add to Queue</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Watch After */}
                {watchAfter.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-200 mb-2">Watch After</h4>
                    <div className="flex gap-3 overflow-x-auto py-2">
                      {watchAfter.map((item) => (
                        <div key={`after-${item.id}`} className="w-20 flex-shrink-0 cursor-pointer" onClick={() => play(item, [item, ...queue])}>
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-800">
                            {item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700" />}
                          </div>
                          <p className="mt-1 text-xs font-semibold text-gray-200 line-clamp-2">{item.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button onClick={(e) => { e.stopPropagation(); play(item, [item, ...queue]); }} className="text-xs text-violet-400">Play</button>
                            <button onClick={(e) => { e.stopPropagation(); play(activeContent, [...queue, item]); }} className="text-xs text-gray-400">Add to Queue</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related vertical list */}
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-200">Related</h4>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setRelatedLimit((n) => n + 50)} className="text-xs text-violet-400">Load more</button>
                    </div>
                  </div>
                    <div className="mt-3 grid grid-cols-1 gap-4">
                    {relatedList.map((item) => (
                        <div key={`rel-${item.id}`} className="flex gap-4 items-start cursor-pointer" onClick={() => play(item, relatedList)}>
                        <div className="w-[336px] aspect-video rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                          {item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-gray-200 line-clamp-2">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-1">{item.author}</p>
                          <div className="flex gap-3 mt-2">
                            <button onClick={(e) => { e.stopPropagation(); play(item, relatedList); }} className="text-xs text-violet-400">Play</button>
                            <button onClick={(e) => { e.stopPropagation(); play(activeContent, [...queue, item]); }} className="text-xs text-gray-400">Add to Queue</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Description or Comments section could go here */}
          </>
        )}
      </div>

      {/* Right Section: Suggestions / Queue */}
      {!isMinimized && (
        <div className="w-full xl:w-[360px] border-t xl:border-t-0 xl:border-l border-gray-800 bg-gray-900 flex flex-col flex-shrink-0 xl:h-full xl:overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">Up Next</h3>
            <div className="flex gap-1">
              <button onClick={previous} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 transition-colors">
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button onClick={next} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 transition-colors">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal scroll on mobile, vertical on desktop */}
          <div className="flex-1 overflow-x-auto xl:overflow-y-auto p-4 flex flex-row xl:flex-col gap-4">
            {queue.filter(q => q.id !== activeContent.id).map((item) => (
              <div
                key={item.id}
                onClick={() => play(item)}
                className="min-w-[260px] xl:min-w-0 flex flex-col xl:flex-row gap-3 group cursor-pointer"
              >
                <div className="relative w-full xl:w-40 aspect-video rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs font-bold uppercase">{item.source}</div>
                  )}
                </div>
                <div className="flex flex-col py-1 overflow-hidden">
                  <p className="text-sm font-semibold text-gray-200 group-hover:text-violet-400 line-clamp-2 leading-snug">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{item.author}</p>
                  <p className="text-xs text-gray-500">{item.source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSummary && !isMinimized && (
        <ContentDetail contentId={activeContent.id} onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
}
