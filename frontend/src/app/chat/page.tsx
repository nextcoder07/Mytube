'use client';
// frontend/src/app/chat/page.tsx
import React, { useRef, useEffect } from 'react';
import ChatInput from '../../components/chat/ChatInput';
import ChatMessage from '../../components/chat/ChatMessage';
import { useChat } from '../../hooks/useChat';

export default function ChatPage() {
  const { messages, isLoading, sendMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 glass-panel">
        <h1 className="text-lg font-semibold text-white">AI Chat</h1>
        <p className="text-xs text-gray-400">Your personalized learning assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <p className="text-lg font-medium text-gray-300">Ask me anything</p>
            <p className="text-sm mt-1">I&apos;ll help you learn, find resources, and build roadmaps.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </main>
  );
}
