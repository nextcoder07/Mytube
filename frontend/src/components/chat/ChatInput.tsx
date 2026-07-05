'use client';
// frontend/src/components/chat/ChatInput.tsx
import React, { useState, useRef, KeyboardEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface Props {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, isLoading = false, placeholder = 'Ask anything…' }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex items-end gap-3 p-4 bg-gray-900/60 border-t border-gray-800 backdrop-blur-sm">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 resize-none bg-gray-800/80 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition disabled:opacity-50"
      />
      <button
        id="chat-send-btn"
        onClick={handleSend}
        disabled={!text.trim() || isLoading}
        className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <PaperAirplaneIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
