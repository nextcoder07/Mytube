"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackEvent = trackEvent;
exports.getUserAnalytics = getUserAnalytics;
// src/analytics/index.ts — Analytics event tracker
const supabase_1 = require("../config/supabase");
async function trackEvent(userId, event, metadata) {
    await supabase_1.supabase.from('analytics').insert({ user_id: userId, event, metadata });
}
async function getUserAnalytics(userId) {
    const { data, error } = await supabase_1.supabase
        .from('analytics')
        .select('event, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200);
    if (error || !data)
        return [];
    return data;
}
//# sourceMappingURL=index.js.map