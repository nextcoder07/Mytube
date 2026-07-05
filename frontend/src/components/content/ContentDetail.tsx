// src/components/content/ContentDetail.tsx
import React, { useEffect, useState } from "react";
import { Summary } from "../../types/content";
import api from "../../lib/api";
import LoadingSpinner from "../common/LoadingSpinner";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ContentDetail({
  contentId,
  onClose,
}: {
  contentId: string | null;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contentId) return;

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.post("/summary", { contentId });
        setSummary(res.data.data);
      } catch (err) {
        console.error("Summary error:", err);
        setError("Failed to generate AI summary. Please check your API configuration or try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [contentId]);

  if (!contentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-900 bg-gray-900/30">
          <div className="flex items-center gap-2 text-violet-400">
            <SparklesIcon className="h-5 w-5 animate-pulse" />
            <h2 className="text-lg font-bold text-glow text-white">AI Content Summary</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <LoadingSpinner size="md" />
              <p className="text-sm text-gray-400 mt-4 font-medium animate-pulse">
                Analyzing resource content...
              </p>
            </div>
          ) : error ? (
            <div className="py-6 text-center text-red-400">
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              {/* Summary text */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Learning Summary
                </h3>
                <p className="text-sm text-gray-200 leading-relaxed bg-gray-900/40 p-4 rounded-xl border border-gray-900">
                  {summary.summary}
                </p>
              </div>

              {/* Key points bullet items */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Key Takeaways
                </h3>
                <ul className="space-y-2.5">
                  {summary.keyPoints.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2.5 text-sm text-gray-300 leading-normal"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-xs font-bold text-violet-400 border border-violet-500/20">
                        {index + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cache status footer */}
              {summary.cached && (
                <div className="text-[10px] text-gray-600 italic text-right">
                  Fetched instantly from cache
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-900 bg-gray-900/20">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-300 bg-slate-900 hover:bg-slate-800 border border-gray-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
