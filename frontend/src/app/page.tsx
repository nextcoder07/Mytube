import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import BackendStatus from '@/components/common/BackendStatus';

export const metadata: Metadata = {
  title: 'MyTube – Personalized Learning Platform',
  description: 'Boost your skill acquisition and track goals using MyTube, the ultimate personalized feed and watch history platform for curated educational resources.',
  keywords: ['learning', 'personalized learning', 'educational curation', 'watch history', 'goals tracking', 'AI feed'],
};

export default function Home() {
  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'MyTube',
    'applicationCategory': 'EducationalApplication',
    'operatingSystem': 'Web',
    'description': 'AI‑powered personalized learning platform that curates articles, courses, repositories, and videos to fit your educational goals.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
  };

  return (
    <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 md:py-20 lg:py-28 font-sans">
      {/* Inject JSON-LD Schema for Google Search bots */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="text-center max-w-3xl space-y-6 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-violet-400 bg-violet-950/40 border border-violet-500/20 rounded-full animate-pulse">
          <span>✨ Optimize Your Learning Journey</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-indigo-200 to-pink-400">
          Transform Content Into Knowledge
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          MyTube curates educational videos, documentation, articles, and GitHub repositories tailored to your personal goals. Complete tasks, build streaks, and track watch history.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center w-full max-w-md">
          <Link
            href="/feed"
            className="btn-neon flex items-center justify-center h-12 px-8 text-sm font-semibold rounded-full shadow-lg shadow-violet-500/20 hover:shadow-pink-500/30 transition-all text-white"
          >
            Explore Learning Feed
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center h-12 px-8 text-sm font-semibold text-gray-300 bg-gray-900 border border-gray-800 hover:border-gray-700 hover:text-white rounded-full transition-all"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Backend Connectivity Check */}
        <BackendStatus />
      </header>

      {/* Feature Highlights Section */}
      <article className="mt-20 md:mt-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        <section className="glow-card p-6 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-lg bg-violet-600/10 flex items-center justify-center border border-violet-500/20 mb-4 text-violet-400 font-bold text-lg">
              🎯
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Dynamic Learning Goals</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Create structured goals and track your progress. The system recommends topics matching your chosen milestones.
            </p>
          </div>
        </section>

        <section className="glow-card p-6 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-lg bg-pink-600/10 flex items-center justify-center border border-pink-500/20 mb-4 text-pink-400 font-bold text-lg">
              ⚡
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Curated Smart Feed</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Aggregate Reddit discussions, Youtube educational tutorials, GitHub repositories, and Dev.to posts in one single place.
            </p>
          </div>
        </section>

        <section className="glow-card p-6 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-lg bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20 mb-4 text-indigo-400 font-bold text-lg">
              📺
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Smart Watch History</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Track what you watched and read across your profile. Watched items persist for an hour before being filtered from your feed.
            </p>
          </div>
        </section>
      </article>
    </section>
  );
}
