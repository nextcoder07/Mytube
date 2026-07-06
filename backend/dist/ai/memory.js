"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchHistory = fetchHistory;
exports.saveMessage = saveMessage;
exports.createChat = createChat;
// src/ai/memory.ts — Conversation history management
const supabase_1 = require("../config/supabase");
/**
 * Fetch the last N messages for a chat session.
 */
async function fetchHistory(chatId, limit = 20) {
    const { data, error } = await supabase_1.supabase
        .from('messages')
        .select('role, content, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error || !data)
        return [];
    return data.reverse();
}
/**
 * Persist a user or assistant message.
 */
async function saveMessage(chatId, role, content) {
    await supabase_1.supabase.from('messages').insert({ chat_id: chatId, role, content });
}
/**
 * Create a new chat session and return its id.
 */
async function createChat(userId, goalId, title) {
    const { data, error } = await supabase_1.supabase
        .from('chats')
        .insert({ user_id: userId, goal_id: goalId, title })
        .select('id')
        .single();
    if (error || !data)
        throw new Error('Failed to create chat session');
    return data.id;
}
//# sourceMappingURL=memory.js.map