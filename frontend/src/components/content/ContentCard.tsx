// src/components/content/ContentCard.tsx
import React from "react";
import { Content } from "../../types/content";
import {
  PlayIcon,
  BookOpenIcon,
  CodeBracketIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function ContentCard({
  content,
  onClick,
}: {
  content: Content;
  onClick?: (content: Content) => void;
}) {

  const sourceColors: Record<string, string> = {
    youtube: "bg-red-500/10 text-red-500 border border-red-500/20",
    github: "bg-slate-400/10 text-slate-300 border border-slate-400/20",
    reddit: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
    medium: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    website: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  };

  const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    video: PlayIcon,
    article: BookOpenIcon,
    repo: CodeBracketIcon,
    post: ChatBubbleBottomCenterTextIcon,
    course: BookOpenIcon,
  };

  const IconComponent = typeIcons[content.type] || BookOpenIcon;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div 
      className="glow-card flex flex-col h-full overflow-hidden cursor-pointer hover:border-violet-500/50 transition-colors"
      onClick={() => onClick && onClick(content)}
    >
      {/* Thumbnail or Icon container */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center group">
        {content.thumbnail ? (
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <IconComponent className="h-16 w-16 text-slate-700 group-hover:text-violet-500 transition-colors" />
        )}

        {/* Video duration badge */}
        {content.type === "video" && content.duration ? (
          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-xs font-semibold text-white rounded">
            {formatDuration(content.duration)}
          </span>
        ) : null}

        {/* Source badge */}
        <span
          className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            sourceColors[content.source] || "bg-violet-500/10 text-violet-400 border border-violet-500/20"
          }`}
        >
          {content.source}
        </span>
      </div>

      {/* Details info */}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="text-base font-bold line-clamp-2 text-white group-hover:text-violet-400 transition-colors mb-1.5">
          {content.title}
        </h3>

        {content.author && (
          <p className="text-xs text-gray-400 mb-2 font-medium">By {content.author}</p>
        )}

        <p className="text-xs text-gray-400 line-clamp-3 mb-4 leading-relaxed flex-1">
          {content.description || "No description provided."}
        </p>

        {/* Metadata stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 border-t border-gray-900 pt-3 mt-auto">
          {content.source === "github" && content.metadata.stars !== undefined && (
            <span>⭐ {content.metadata.stars.toLocaleString()} stars</span>
          )}
          {content.source === "youtube" && content.viewCount !== undefined && (
            <span>👁️ {content.viewCount.toLocaleString()} views</span>
          )}
          {content.source === "reddit" && content.metadata.ups !== undefined && (
            <span>🔺 {content.metadata.ups} points</span>
          )}
          {content.tags && content.tags.slice(0, 2).map((t) => (
            <span key={t} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-gray-400 rounded">
              #{t}
            </span>
          ))}
        </div>

        {/* AI Explanation block if available */}
        {content.metadata.aiExplanation && (
          <div className="mt-2 p-2.5 bg-violet-950/20 border border-violet-500/20 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs text-violet-400 font-bold mb-1">
              <SparklesIcon className="h-4.5 w-4.5" />
              <span>AI Recommendation Context</span>
            </div>
            <p className="text-[11px] leading-normal text-violet-300 italic">
              &quot;{content.metadata.aiExplanation}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
