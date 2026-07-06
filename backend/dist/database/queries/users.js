"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findById = findById;
exports.findByEmail = findByEmail;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
// src/database/queries/users.ts — User query helpers
const supabase_1 = require("../../config/supabase");
async function findById(userId) {
    const { data, error } = await supabase_1.supabase
        .from('users')
        .select('*, profiles(*)')
        .eq('id', userId)
        .single();
    if (error)
        return null;
    return data;
}
async function findByEmail(email) {
    const { data, error } = await supabase_1.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    if (error)
        return null;
    return data;
}
async function createUser(id, email, displayName, photoUrl) {
    const { data, error } = await supabase_1.supabase
        .from('users')
        .insert({ id, email, display_name: displayName, photo_url: photoUrl })
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function updateUser(userId, fields) {
    const { data, error } = await supabase_1.supabase
        .from('users')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
    if (error)
        throw new Error(error.message);
    return data;
}
async function deleteUser(userId) {
    await supabase_1.supabase.from('users').delete().eq('id', userId);
}
//# sourceMappingURL=users.js.map