"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessage = exports.getChatMessages = exports.getChatSessions = exports.createChatSession = void 0;
const supabase_1 = require("../utils/supabase");
const gateway_1 = __importDefault(require("../ai/gateway"));
const prompt_1 = require("../ai/prompt");
const response_1 = require("../utils/response");
const errors_1 = require("../utils/errors");
const createChatSession = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const { goalId, title } = req.body;
        const { data: chat, error } = await supabase_1.supabase
            .from("chats")
            .insert({
            user_id: user.uid,
            goal_id: goalId || null,
            title: title || "New Learning Chat",
        })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json((0, response_1.success)(chat, "Chat session created"));
    }
    catch (err) {
        next(err);
    }
};
exports.createChatSession = createChatSession;
const getChatSessions = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const { data: chats, error } = await supabase_1.supabase
            .from("chats")
            .select("*, goals(title)")
            .eq("user_id", user.uid)
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        res.status(200).json((0, response_1.success)(chats, "Chat sessions fetched"));
    }
    catch (err) {
        next(err);
    }
};
exports.getChatSessions = getChatSessions;
const getChatMessages = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const chatId = req.params.id;
        // Verify chat owner
        const { data: chat, error: ownerError } = await supabase_1.supabase
            .from("chats")
            .select("id")
            .eq("id", chatId)
            .eq("user_id", user.uid)
            .single();
        if (ownerError || !chat) {
            return next(new errors_1.HttpError(403, "Access denied or session not found"));
        }
        const { data: messages, error } = await supabase_1.supabase
            .from("messages")
            .select("*")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true });
        if (error)
            throw error;
        res.status(200).json((0, response_1.success)(messages, "Messages fetched"));
    }
    catch (err) {
        next(err);
    }
};
exports.getChatMessages = getChatMessages;
const chatMessage = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            return next(new errors_1.HttpError(401, "Unauthorized"));
        const chatId = req.params.id;
        const { message } = req.body;
        if (!message) {
            return next(new errors_1.HttpError(400, "Message parameter is required"));
        }
        // 1. Verify owner & retrieve goal info
        const { data: chat, error: ownerError } = await supabase_1.supabase
            .from("chats")
            .select("*, goals(*)")
            .eq("id", chatId)
            .eq("user_id", user.uid)
            .single();
        if (ownerError || !chat) {
            return next(new errors_1.HttpError(403, "Access denied or session not found"));
        }
        // 2. Fetch last 10 messages for context
        const { data: pastDbMessages } = await supabase_1.supabase
            .from("messages")
            .select("role, content")
            .eq("chat_id", chatId)
            .order("created_at", { ascending: true })
            .limit(10);
        const historyStr = (pastDbMessages || [])
            .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
            .join("\n");
        // 3. Save user message to database
        const { error: userMsgError } = await supabase_1.supabase.from("messages").insert({
            chat_id: chatId,
            role: "user",
            content: message,
        });
        if (userMsgError)
            throw userMsgError;
        // 4. Fetch user profile context
        const { data: profile } = await supabase_1.supabase
            .from("profiles")
            .select("learning_style")
            .eq("id", user.uid)
            .single();
        // 5. Compile prompt template (plan.md section 8)
        const prompt = (0, prompt_1.buildPrompt)("chat", {
            goal: chat.goals ? `${chat.goals.title}: ${chat.goals.description || ""}` : "General Software Development",
            level: chat.goals?.difficulty || "beginner",
            learningStyle: profile?.learning_style || "mixed",
            history: historyStr,
            message,
        });
        // 6. Build the message array for AI gateway
        // We pass the compiled prompt as the user query
        const aiMessages = [
            { role: "user", content: prompt }
        ];
        // 7. Call AI Gateway
        const aiReply = await gateway_1.default.chat(aiMessages);
        // 8. Save AI response to database
        const { error: assistantMsgError } = await supabase_1.supabase.from("messages").insert({
            chat_id: chatId,
            role: "assistant",
            content: aiReply,
        });
        if (assistantMsgError)
            throw assistantMsgError;
        res.status(200).json((0, response_1.success)({ reply: aiReply }, "AI reply received"));
    }
    catch (err) {
        next(err);
    }
};
exports.chatMessage = chatMessage;
//# sourceMappingURL=ai.controller.js.map