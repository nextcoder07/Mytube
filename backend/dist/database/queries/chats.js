"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listChats = listChats;
exports.createChat = createChat;
exports.getMessages = getMessages;
exports.addMessage = addMessage;
// src/database/queries/chats.ts — Chat/message query helpers
const supabase_1 = require("../../config/supabase");
async function listChats(userId) {
    const { data, error } = await supabase_1.supabase
        .from('chats')
        .select('id, title, created_at, goal_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error)
        return [];
    return data;
}
async function createChat(userId, title, goalId) {
    const { data, error } = await supabase_1.supabase
        .from('chats')
        .insert({ user_id: userId, title, goal_id: goalId ?? null })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function getMessages(chatId, limit = 50) {
    const { data, error } = await supabase_1.supabase
        .from('messages')
        .select('id, role, content, created_at')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
        .limit(limit);
    if (error)
        return [];
    return data;
}
async function addMessage(chatId, role, content) {
    const { data, error } = await supabase_1.supabase
        .from('messages')
        .insert({ chat_id: chatId, role, content })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
//# sourceMappingURL=chats.js.map