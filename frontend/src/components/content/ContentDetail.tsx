// src/components/content/ContentDetail.tsx
import React, { useCallback, useEffect, useState } from "react";
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
  const [transcript, setTranscript] = useState("");
  const [visualNotes, setVisualNotes] = useState("");

  const fetchSummary = useCallback(async (options?: { transcript?: string; visualNotes?: string }) => {
    if (!contentId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/summary", {
        contentId,
        transcript: options?.transcript,
        visualNotes: options?.visualNotes,
      });
      setSummary(res.data.data);
    } catch (err) {
      console.error("Summary error:", err);
      setError("Failed to generate AI summary. Please check your API configuration or try again.");
    } finally {
      setLoading(false);
    }
  }, [contentId]);

  useEffect(() => {
    if (!contentId) return;
    fetchSummary();
  }, [contentId, fetchSummary]);

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
          <div className="space-y-5 mb-6">
            <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Enriched video summary</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Paste transcript/caption text or describe screen content and timestamps to produce a richer summary.
                  </p>
                </div>
                <button
                  onClick={() => fetchSummary({ transcript, visualNotes })}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-semibold rounded-2xl bg-violet-600 hover:bg-violet-500 text-white transition disabled:opacity-50"
                >
                  {loading ? "Generating…" : "Generate enriched summary"}
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Transcript / captions
                  </label>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    rows={4}
                    placeholder="Paste spoken text, closed captions, or dialogue here."
                    className="w-full rounded-2xl border border-gray-800 bg-gray-950 text-sm text-gray-100 placeholder-gray-600 p-3 focus:border-violet-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Screen notes & timestamps
                  </label>
                  <textarea
                    value={visualNotes}
                    onChange={(e) => setVisualNotes(e.target.value)}
                    rows={4}
                    placeholder="Describe what appears on screen, include timestamps or thumbnail notes, e.g. 00:12 - dashboard view, 01:30 - chart explanation."
                    className="w-full rounded-2xl border border-gray-800 bg-gray-950 text-sm text-gray-100 placeholder-gray-600 p-3 focus:border-violet-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

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
