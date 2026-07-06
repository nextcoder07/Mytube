"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = createNotification;
exports.getNotifications = getNotifications;
exports.markRead = markRead;
// src/notifications/index.ts — In-app notification stub
const supabase_1 = require("../config/supabase");
async function createNotification(userId, type, title, body) {
    await supabase_1.supabase.from('notifications').insert({ user_id: userId, type, title, body, read: false });
}
async function getNotifications(userId) {
    const { data, error } = await supabase_1.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error || !data)
        return [];
    return data;
}
async function markRead(notificationId) {
    await supabase_1.supabase.from('notifications').update({ read: true }).eq('id', notificationId);
}
//# sourceMappingURL=index.js.map