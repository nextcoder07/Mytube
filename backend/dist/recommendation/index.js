"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecommendations = getRecommendations;
exports.upsertRecommendation = upsertRecommendation;
// src/recommendation/index.ts — Recommendation engine stub
const supabase_1 = require("../config/supabase");
async function getRecommendations(userId, limit = 10) {
    const { data, error } = await supabase_1.supabase
        .from('recommendations')
        .select('content_id, score, reason, content(*)')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(limit);
    if (error || !data)
        return [];
    return data.map((row) => row.content);
}
async function upsertRecommendation(userId, contentId, score, reason) {
    await supabase_1.supabase.from('recommendations').upsert({
        user_id: userId,
        content_id: contentId,
        score,
        reason,
    });
}
//# sourceMappingURL=index.js.map