'use client';

import React, { useState } from "react";
import { useGoals } from "../../hooks/useGoals";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  BookOpenIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function GoalsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    goals,
    roadmaps,
    isLoading,
    createGoal,
    deleteGoal,
    generateRoadmap,
    isGeneratingRoadmap,
  } = useGoals();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [targetDate, setTargetDate] = useState("");
  const [activeRoadmap, setActiveRoadmap] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createGoal({
        title,
        description,
        category,
        difficulty,
        targetDate: targetDate || undefined,
      });
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setCategory("General");
      setDifficulty("beginner");
      setTargetDate("");
    } catch (err) {
      console.error("Failed to create goal:", err);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-gray-400">Loading learning goals & roadmaps...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Personalized Goals & Roadmaps</h2>
        <p className="text-gray-400 max-w-md mb-6">
          Sign in to define your custom learning goals and automatically generate structured, AI-powered learning paths.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Learning Goals</h1>
          <p className="text-sm text-gray-400 mt-1">
            Create goals, track progress, and use AI to generate complete study guides and roadmaps.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-neon flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Create New Goal
        </button>
      </div>

      {/* Main Grid: Goals list & Roadmap details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 1 Column: Goals List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-300 mb-2">Active Goals</h2>
          {goals.length === 0 ? (
            <div className="p-6 bg-gray-900/40 border border-gray-800 rounded-2xl text-center text-gray-500">
              No learning goals defined yet. Create one above to get started!
            </div>
          ) : (
            goals.map((goal) => {
              const matchedRoadmap = roadmaps.find((r) => r.goalId === goal.id);
              return (
                <div
                  key={goal.id}
                  className={`glow-card p-5 cursor-pointer transition-all duration-300 relative border ${
                    activeRoadmap === goal.id
                      ? "border-violet-500 bg-violet-950/10 shadow-lg shadow-violet-500/10"
                      : "border-gray-800 bg-gray-900/30"
                  }`}
                  onClick={() => setActiveRoadmap(goal.id)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] uppercase font-bold tracking-wider">
                      {goal.category}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteGoal(goal.id);
                      }}
                      className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-800/40 rounded transition-colors"
                      title="Delete goal"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-base font-bold text-white mt-2 group-hover:text-violet-400">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-normal">
                      {goal.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-gray-500 mt-4 pt-3 border-t border-gray-900">
                    <span className="capitalize">⭐ {goal.difficulty}</span>
                    {goal.targetDate && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {matchedRoadmap ? (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Roadmap Generated</span>
                    </div>
                  ) : (
                    <button
                      disabled={isGeneratingRoadmap}
                      onClick={(e) => {
                        e.stopPropagation();
                        generateRoadmap({ goalId: goal.id });
                      }}
                      className="mt-3 w-full py-1.5 px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow"
                    >
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Generate AI Roadmap
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right 2 Columns: Selected Roadmap Viewer */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-300 mb-2">Roadmap Details</h2>
          {activeRoadmap ? (
            (() => {
              const goal = goals.find((g) => g.id === activeRoadmap);
              const roadmap = roadmaps.find((r) => r.goalId === activeRoadmap);

              if (!goal) return null;

              return (
                <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">{goal.title}</h2>
                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">{goal.description || "No description provided."}</p>
                  </div>

                  {roadmap ? (
                    <div className="space-y-6">
                      <div className="border-t border-gray-800 pt-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <BookOpenIcon className="w-5 h-5 text-violet-400" />
                          Structured Study Schedule
                        </h3>
                        <div className="relative border-l-2 border-violet-500/30 pl-6 ml-3 space-y-6">
                          {roadmap.phases.map((phase, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white border border-gray-950">
                                {idx + 1}
                              </span>
                              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                                <div className="flex justify-between items-start gap-4">
                                  <h4 className="font-bold text-white text-sm">{phase.title}</h4>
                                  {phase.duration && (
                                    <span className="px-2 py-0.5 rounded bg-violet-600/20 border border-violet-500/20 text-violet-400 text-[10px] font-bold">
                                      {phase.duration}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 mt-1 leading-normal">
                                  {phase.description}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {phase.topics.map((topic, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-gray-300 rounded text-[10px] font-medium"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <SparklesIcon className="w-12 h-12 text-violet-400/30 mb-4" />
                      <h4 className="font-bold text-white text-sm">No Roadmap Generated Yet</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-xs mb-4">
                        Use our AI roadmap assistant to map out structured phases, weekly timelines, and recommended learning goals.
                      </p>
                      <button
                        disabled={isGeneratingRoadmap}
                        onClick={() => generateRoadmap({ goalId: goal.id })}
                        className="btn-neon px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2"
                      >
                        <SparklesIcon className="w-4 h-4" />
                        Generate AI Roadmap
                      </button>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="bg-gray-900/10 border border-gray-800 border-dashed rounded-2xl p-12 text-center text-gray-500">
              Select a goal from the list to view its learning roadmap, timeline, and topics.
            </div>
          )}
        </div>
      </div>

      {/* Goal creation modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-950 border border-gray-850 rounded-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white">Create New Learning Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master React & Next.js"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Describe what you want to learn or achieve..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow transition-colors"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
