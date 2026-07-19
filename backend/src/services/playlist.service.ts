// src/services/playlist.service.ts
import { supabase } from "../utils/supabase";
import SearchService from "./search.service";
import AIGateway from "../ai/gateway";

export class PlaylistService {
  private static readonly DEFAULT_WATCH_LATER_TITLE = "Watch Later";

  private static async ensureDefaultWatchLaterPlaylist(userId: string) {
    const { data: existingPlaylists, error: fetchError } = await supabase
      .from("playlists")
      .select("id, title")
      .eq("user_id", userId)
      .eq("title", this.DEFAULT_WATCH_LATER_TITLE)
      .limit(1);

    if (fetchError) throw fetchError;

    if (existingPlaylists && existingPlaylists.length > 0) {
      return existingPlaylists[0];
    }

    const { data, error } = await supabase
      .from("playlists")
      .insert({
        user_id: userId,
        title: this.DEFAULT_WATCH_LATER_TITLE,
        description: "Saved for later",
        is_public: false,
        ai_generated: false,
      })
      .select("id, title")
      .single();

    if (error) throw error;
    return data;
  }

  static async getPlaylists(userId: string) {
    await this.ensureDefaultWatchLaterPlaylist(userId);

    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getPlaylist(userId: string, playlistId: string) {
    await this.ensureDefaultWatchLaterPlaylist(userId);

    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .single();

    if (playlistError || !playlist) {
      throw playlistError || new Error("Playlist not found");
    }

    // Fetch items with content details
    const { data: items, error: itemsError } = await supabase
      .from("playlist_items")
      .select("*, content(*)")
      .eq("playlist_id", playlistId)
      .order("position", { ascending: true });

    if (itemsError) throw itemsError;

    return {
      ...playlist,
      items: items || [],
    };
  }

  static async createPlaylist(
    userId: string,
    playlistData: { title: string; description?: string; isPublic?: boolean }
  ) {
    const { data, error } = await supabase
      .from("playlists")
      .insert({
        user_id: userId,
        title: playlistData.title,
        description: playlistData.description || "",
        is_public: playlistData.isPublic || false,
        ai_generated: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async addPlaylistItem(
    userId: string,
    playlistId: string,
    contentId: string
  ) {
    // 1. Verify playlist ownership
    const { data: playlist, error: ownerError } = await supabase
      .from("playlists")
      .select("id")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .single();

    if (ownerError || !playlist) {
      throw new Error("Playlist not found or access denied");
    }

    // 2. Find next position index
    const { data: items } = await supabase
      .from("playlist_items")
      .select("position")
      .eq("playlist_id", playlistId)
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition = items && items.length > 0 ? items[0].position + 1 : 1;

    // 3. Add playlist item (upsert to ignore duplicate additions gracefully)
    const { data, error } = await supabase
      .from("playlist_items")
      .upsert(
        {
          playlist_id: playlistId,
          content_id: contentId,
          position: nextPosition,
        },
        { onConflict: "playlist_id,content_id" }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removePlaylistItem(
    userId: string,
    playlistId: string,
    contentId: string
  ) {
    // Verify ownership
    const { data: playlist, error: ownerError } = await supabase
      .from("playlists")
      .select("id")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .single();

    if (ownerError || !playlist) {
      throw new Error("Playlist not found or access denied");
    }

    const { error } = await supabase
      .from("playlist_items")
      .delete()
      .eq("playlist_id", playlistId)
      .eq("content_id", contentId);

    if (error) throw error;
    return true;
  }

  static async deletePlaylist(userId: string, playlistId: string) {
    const { data: playlist, error: lookupError } = await supabase
      .from("playlists")
      .select("id, title")
      .eq("id", playlistId)
      .eq("user_id", userId)
      .single();

    if (lookupError || !playlist) {
      throw lookupError || new Error("Playlist not found");
    }

    if (playlist.title === this.DEFAULT_WATCH_LATER_TITLE) {
      throw new Error("Watch Later playlist cannot be deleted");
    }

    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", playlistId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  }

  /**
   * AI-Generated Playlist.
   * Takes a topic prompt, queries AI for structured steps, finds corresponding videos,
   * creates the playlist, and populates the items automatically!
   */
  static async generateAIPlaylist(userId: string, topic: string) {
    const prompt = `
Create a structured 5-step learning course syllabus for the topic: "${topic}".
Identify 5 specific concepts that a learner needs to study in order, from absolute beginner to intermediate.
For each step, provide a topic search query that we can use to find learning videos, and a short explanation.

Respond ONLY with a valid JSON object. Do not include markdown formatting.
Schema:
{
  "title": "AI Playlist: mastering Docker",
  "description": "5-step learning course to learn containerization.",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Introduction to Docker",
      "searchQuery": "docker crash course beginners"
    }
  ]
}
`;

    try {
      const aiResponse = await AIGateway.generate(prompt);
      const parsed = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());

      // 1. Create the AI playlist
      const { data: playlist, error: playlistError } = await supabase
        .from("playlists")
        .insert({
          user_id: userId,
          title: parsed.title || `AI Learning: ${topic}`,
          description: parsed.description || `AI generated syllabus for ${topic}`,
          is_public: false,
          ai_generated: true,
        })
        .select()
        .single();

      if (playlistError || !playlist) throw playlistError || new Error("Failed to create AI playlist record");

      // 2. Search and add content for each step
      const steps = parsed.steps || [];
      for (const step of steps) {
        const query = step.searchQuery || step.title;
        // Search YouTube primarily
        const searchResults = await SearchService.search(userId, query, {
          limit: 1,
          providers: ["youtube"],
        });

        if (searchResults.length > 0) {
          const content = searchResults[0];
          await this.addPlaylistItem(userId, playlist.id, content.id).catch((e) =>
            console.error(`Failed to add content ${content.id} to AI playlist:`, e.message)
          );
        }
      }

      return this.getPlaylist(userId, playlist.id);
    } catch (err: any) {
      console.error("AI Playlist generation failed:", err.message);
      throw err;
    }
  }
}

export default PlaylistService;
