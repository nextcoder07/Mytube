"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buckets = void 0;
exports.uploadFile = uploadFile;
exports.deleteFile = deleteFile;
// src/storage/index.ts — Supabase Storage helper
const supabase_1 = require("../config/supabase");
exports.Buckets = {
    PROFILE_IMAGES: 'profile-images',
    AI_AUDIO: 'ai-audio',
    ATTACHMENTS: 'attachments',
    EXPORTS: 'exports',
};
async function uploadFile(bucket, path, file, contentType = 'application/octet-stream') {
    const { data, error } = await supabase_1.supabase.storage
        .from(bucket)
        .upload(path, file, { contentType, upsert: true });
    if (error)
        throw new Error(`Storage upload failed: ${error.message}`);
    const { data: urlData } = supabase_1.supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
}
async function deleteFile(bucket, path) {
    await supabase_1.supabase.storage.from(bucket).remove([path]);
}
//# sourceMappingURL=index.js.map