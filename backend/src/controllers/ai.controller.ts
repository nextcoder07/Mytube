// src/controllers/ai.controller.ts
import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase";
import AIGateway, { Message as AIMessage } from "../ai/gateway";
import { buildPrompt } from "../ai/prompt";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const createChatSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const { goalId, title } = req.body;

    const { data: chat, error } = await supabase
      .from("chats")
      .insert({
        user_id: user.uid,
        goal_id: goalId || null,
        title: title || "New Learning Chat",
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(success(chat, "Chat session created"));
  } catch (err: any) {
    next(err);
  }
};

export const getChatSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const { data: chats, error } = await supabase
      .from("chats")
      .select("*, goals(title)")
      .eq("user_id", user.uid)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json(success(chats, "Chat sessions fetched"));
  } catch (err: any) {
    next(err);
  }
};

export const getChatMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const chatId = req.params.id;

    // Verify chat owner
    const { data: chat, error: ownerError } = await supabase
      .from("chats")
      .select("id")
      .eq("id", chatId)
      .eq("user_id", user.uid)
      .single();

    if (ownerError || !chat) {
      return next(new HttpError(403, "Access denied or session not found"));
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    res.status(200).json(success(messages, "Messages fetched"));
  } catch (err: any) {
    next(err);
  }
};

export const chatMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const chatId = req.params.id;
    const { message } = req.body;

    if (!message) {
      return next(new HttpError(400, "Message parameter is required"));
    }

    // 1. Verify owner & retrieve goal info
    const { data: chat, error: ownerError } = await supabase
      .from("chats")
      .select("*, goals(*)")
      .eq("id", chatId)
      .eq("user_id", user.uid)
      .single();

    if (ownerError || !chat) {
      return next(new HttpError(403, "Access denied or session not found"));
    }

    // 2. Fetch last 10 messages for context
    const { data: pastDbMessages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(10);

    const historyStr = (pastDbMessages || [])
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    // 3. Save user message to database
    const { error: userMsgError } = await supabase.from("messages").insert({
      chat_id: chatId,
      role: "user",
      content: message,
    });

    if (userMsgError) throw userMsgError;

    // 4. Fetch user profile context
    const { data: profile } = await supabase
      .from("profiles")
      .select("learning_style")
      .eq("id", user.uid)
      .single();

    // 5. Compile prompt template (plan.md section 8)
    const prompt = buildPrompt("chat", {
      goal: chat.goals ? `${chat.goals.title}: ${chat.goals.description || ""}` : "General Software Development",
      level: chat.goals?.difficulty || "beginner",
      learningStyle: profile?.learning_style || "mixed",
      history: historyStr,
      message,
    });

    // 6. Build the message array for AI gateway
    // We pass the compiled prompt as the user query
    const aiMessages: AIMessage[] = [
      { role: "user", content: prompt }
    ];

    // 7. Call AI Gateway
    const aiReply = await AIGateway.chat(aiMessages);

    // 8. Save AI response to database
    const { error: assistantMsgError } = await supabase.from("messages").insert({
      chat_id: chatId,
      role: "assistant",
      content: aiReply,
    });

    if (assistantMsgError) throw assistantMsgError;

    res.status(200).json(success({ reply: aiReply }, "AI reply received"));
  } catch (err: any) {
    next(err);
  }
};
