"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotesService = void 0;
// src/services/notes.service.ts
const supabase_1 = require("../utils/supabase");
const gateway_1 = __importDefault(require("../ai/gateway"));
class NotesService {
    static async getNotes(userId) {
        const { data, error } = await supabase_1.supabase
            .from("notes")
            .select("*, content(*)")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false });
        if (error)
            throw error;
        return data;
    }
    static async getNote(userId, noteId) {
        const { data, error } = await supabase_1.supabase
            .from("notes")
            .select("*, content(*)")
            .eq("id", noteId)
            .eq("user_id", userId)
            .single();
        if (error)
            throw error;
        return data;
    }
    static async createNote(userId, noteData) {
        const { data, error } = await supabase_1.supabase
            .from("notes")
            .insert({
            user_id: userId,
            content_id: noteData.contentId || null,
            title: noteData.title || "Untitled Note",
            body: noteData.body,
            tags: noteData.tags || [],
        })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    static async updateNote(userId, noteId, updates) {
        const dbUpdates = { updated_at: new Date() };
        if (updates.title !== undefined)
            dbUpdates.title = updates.title;
        if (updates.body !== undefined)
            dbUpdates.body = updates.body;
        if (updates.tags !== undefined)
            dbUpdates.tags = updates.tags;
        const { data, error } = await supabase_1.supabase
            .from("notes")
            .update(dbUpdates)
            .eq("id", noteId)
            .eq("user_id", userId)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    static async deleteNote(userId, noteId) {
        const { error } = await supabase_1.supabase
            .from("notes")
            .delete()
            .eq("id", noteId)
            .eq("user_id", userId);
        if (error)
            throw error;
        return true;
    }
    /**
     * AI Flashcard generation.
     * Reads the study note, generates question and answer flashcards.
     */
    static async generateFlashcards(userId, noteId) {
        const note = await this.getNote(userId, noteId);
        if (!note)
            throw new Error("Note not found");
        const prompt = `
Generate 5 high-quality flashcards to study the topics covered in this study note.
Each flashcard must contain a clear, challenging question and a concise, correct answer.

Study Note:
"${note.body}"

Respond ONLY with a valid JSON array of objects. Do not include markdown formatting.
Schema:
[
  {
    "question": "What is concept X?",
    "answer": "Concept X is defined as..."
  }
]
`;
        try {
            const aiResponse = await gateway_1.default.generate(prompt);
            const parsed = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
            return parsed;
        }
        catch (err) {
            console.error("AI Flashcard generation failed:", err.message);
            throw new Error("AI was unable to generate flashcards from this note. Ensure the note has enough information.");
        }
    }
}
exports.NotesService = NotesService;
exports.default = NotesService;
//# sourceMappingURL=notes.service.js.map