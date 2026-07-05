'use client';
// frontend/src/app/notes/page.tsx
import React, { useState } from 'react';
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function NotesPage() {
  const [newNote, setNewNote] = useState('');

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-gray-400 mt-1">Capture and organize your learning insights.</p>
        </div>
        <button id="new-note-btn" className="btn-neon flex items-center gap-2 px-4 py-2 text-sm">
          <PlusIcon className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Quick note composer */}
      <div className="glow-card p-4 space-y-3">
        <textarea
          id="quick-note-input"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Start a quick note…"
          rows={4}
          className="w-full bg-transparent text-gray-100 text-sm placeholder-gray-500 resize-none focus:outline-none"
        />
        {newNote && (
          <div className="flex justify-end">
            <button className="btn-neon px-4 py-1.5 text-xs">Save Note</button>
          </div>
        )}
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <DocumentTextIcon className="w-12 h-12 text-gray-600 mb-3" />
        <p className="text-gray-400">Your saved notes will appear here.</p>
      </div>
    </main>
  );
}
