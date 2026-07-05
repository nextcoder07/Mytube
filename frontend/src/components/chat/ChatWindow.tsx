// src/components/chat/ChatWindow.tsx
import React from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatMsg {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatWindow({
  messages,
  onSendMessage,
  loading,
}: {
  messages: ChatMsg[];
  onSendMessage: (msg: string) => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col h-[65vh] border border-gray-900 bg-gray-950/60 rounded-2xl overflow-hidden shadow-2xl">
      {/* Messages list */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-6">
            <p className="text-sm font-semibold mb-1">Start a new study session</p>
            <p className="text-xs text-gray-600 max-w-xs">
              Ask questions about roadmaps, coding problems, or explain concepts in detail!
            </p>
          </div>
        ) : (
          messages.map((m, idx) => (
            <ChatMessage key={m.id || idx} role={m.role} content={m.content} />
          ))
        )}
        {loading && (
          <div className="flex items-center space-x-2 text-violet-400 p-3 bg-violet-600/5 border border-violet-500/10 rounded-2xl w-max max-w-[80%] animate-pulse">
            <div className="flex space-x-1">
              <span className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs font-medium">Assistant is thinking...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-gray-900 bg-gray-990/40">
        <ChatInput onSend={onSendMessage} isLoading={loading} />
      </div>
    </div>
  );
}
