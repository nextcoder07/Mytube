'use client';
// frontend/src/components/chat/ChatMessage.tsx
import React from 'react';

interface Props {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: Props) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0 mt-1">
          AI
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
            ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-sm'
            : 'bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-bl-sm'
          }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold ml-3 flex-shrink-0 mt-1">
          You
        </div>
      )}
    </div>
  );
}
