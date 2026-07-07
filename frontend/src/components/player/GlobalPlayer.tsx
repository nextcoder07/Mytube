'use client';
/* eslint-disable @next/next/no-img-element */
// src/components/player/GlobalPlayer.tsx
import React, { useState } from "react";
import { usePlayerStore } from "../../store/player.store";
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

  const [showSummary, setShowSummary] = useState(false);

  if (!activeContent) return null;

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

  const isYouTube = activeContent.source === 'youtube';
  const videoId = isYouTube ? getYoutubeVideoId(activeContent.url) : null;

  return (
    <div className={isMinimized ? "fixed bottom-4 right-4 w-80 shadow-2xl rounded-xl overflow-hidden z-50 bg-gray-950 border border-gray-800 animate-in slide-in-from-bottom-5" : "flex-1 w-full h-full bg-gray-900 flex flex-col xl:flex-row overflow-hidden animate-in fade-in duration-200"}>
      
      {/* Left/Main Section for Maximized OR PIP wrapper for Minimized */}
      <div className={isMinimized ? "w-full flex flex-col" : "flex-1 flex flex-col overflow-y-auto"}>
        
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
             <div className="w-full h-full flex flex-col bg-white overflow-hidden">
               {/* Browser Header */}
               <div className="w-full bg-gray-100 border-b border-gray-300 p-2 flex items-center justify-between text-black text-sm relative z-10">
                 <div className="truncate px-2 font-medium text-gray-700 text-xs w-[65%]">{activeContent.url}</div>
                 <a 
                   href={activeContent.url} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="shrink-0 px-2 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded font-medium transition-colors text-xs shadow"
                 >
                   Open in New Tab
                 </a>
               </div>
               {/* Webpage Viewer */}
               <iframe
                 className="w-full flex-1"
                 src={activeContent.url}
                 title="Webpage Viewer"
                 sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
               ></iframe>
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
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-colors border border-gray-700"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-800 text-sm text-gray-300 leading-relaxed">
                {activeContent.description}
              </div>
            </div>
            {/* Description or Comments section could go here */}
          </>
        )}
      </div>

      {/* Right Section: Suggestions / Queue */}
      {!isMinimized && (
        <div className="w-full xl:w-[360px] border-t xl:border-t-0 xl:border-l border-gray-800 bg-gray-900 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
            <h3 className="font-bold text-white text-lg">Up Next</h3>
            <div className="flex gap-1">
              <button onClick={previous} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 transition-colors">
                 <ChevronLeftIcon className="w-5 h-5"/>
              </button>
               <button onClick={next} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 transition-colors">
                 <ChevronRightIcon className="w-5 h-5"/>
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
