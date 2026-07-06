"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertContent = upsertContent;
exports.findById = findById;
exports.findByUrl = findByUrl;
exports.bulkUpsert = bulkUpsert;
// src/database/queries/content.ts — Content query helpers
const supabase_1 = require("../../config/supabase");
async function upsertContent(content) {
    const { data, error } = await supabase_1.supabase
        .from('content')
        .upsert({
        id: content.id,
        title: content.title,
        url: content.url,
        source: content.source,
        type: content.type,
        thumbnail: content.thumbnail,
        description: content.description,
        author: content.author,
        duration: content.duration,
        difficulty: content.difficulty,
        summary: content.summary,
        tags: content.tags,
        language: content.language,
        metadata: content.metadata,
    }, { onConflict: 'url' })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function findById(contentId) {
    const { data, error } = await supabase_1.supabase
        .from('content')
        .select('*')
        .eq('id', contentId)
        .single();
    if (error)
        return null;
    return data;
}
async function findByUrl(url) {
    const { data, error } = await supabase_1.supabase
        .from('content')
        .select('*')
        .eq('url', url)
        .single();
    if (error)
        return null;
    return data;
}
async function bulkUpsert(items) {
    return Promise.allSettled(items.map(upsertContent));
}
//# sourceMappingURL=content.js.map