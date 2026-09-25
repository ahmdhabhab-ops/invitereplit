import type { Express, RequestHandler } from "express";
import crypto from "crypto";
import { z } from "zod";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "./db";
import { chatConversations, chatMessages, type ChatConversationSummary } from "@shared/schema";

const MAX_BODY = 2000;

export async function ensureChatTables() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      visitor_token text NOT NULL UNIQUE,
      visitor_name text,
      visitor_contact text,
      admin_unread integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now(),
      last_message_at timestamp NOT NULL DEFAULT now()
    )`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id varchar NOT NULL,
      sender text NOT NULL,
      body text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS chat_messages_conversation_idx ON chat_messages (conversation_id, created_at)`);
}

// In-memory sliding-window limiter; good enough for a single app instance.
function rateLimit(limit: number, windowMs: number): RequestHandler {
  const hits = new Map<string, number[]>();
  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      return res.status(429).json({ error: "Too many messages. Please wait a moment." });
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      hits.forEach((times, k) => {
        if (times.every((t) => now - t >= windowMs)) hits.delete(k);
      });
    }
    next();
  };
}

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

async function sendTelegram(text: string) {
  if (!telegramConfigured()) return { ok: false, error: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set" };
  const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Plain text (no parse_mode) so visitor input can't inject formatting or links.
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: text.slice(0, 4000), disable_web_page_preview: true }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `Telegram ${res.status}: ${detail.slice(0, 200)}` };
  }
  return { ok: true as const };
}

function notifyNewMessage(name: string | null, contact: string | null, body: string, isNewConversation: boolean) {
  const who = [name || "Website visitor", contact].filter(Boolean).join(" · ");
  const header = isNewConversation ? "💬 New chat on einvite.me" : "💬 New message on einvite.me";
  sendTelegram(`${header}\nFrom: ${who}\n\n${body}\n\nReply: https://einvite.me/admin`)
    .then((r) => { if (!r.ok) console.error("Telegram notification failed:", r.error); })
    .catch((err) => console.error("Telegram notification failed:", err));
}

const visitorMessageSchema = z.object({
  body: z.string().trim().min(1).max(MAX_BODY),
  name: z.string().trim().max(80).optional(),
  contact: z.string().trim().max(120).optional(),
});

const adminMessageSchema = z.object({ body: z.string().trim().min(1).max(MAX_BODY) });

async function findConversationByToken(token: string | undefined) {
  if (!token || token.length > 100) return undefined;
  const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.visitorToken, token));
  return conversation;
}

async function listMessages(conversationId: string) {
  return db
    .select({ id: chatMessages.id, sender: chatMessages.sender, body: chatMessages.body, createdAt: chatMessages.createdAt })
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(asc(chatMessages.createdAt))
    .limit(500);
}

export function registerChatRoutes(app: Express, requireStaff: RequestHandler, requireAdmin: RequestHandler) {
  const visitorToken = (req: Parameters<RequestHandler>[0]) => req.get("x-chat-token") || undefined;

  app.post("/api/chat/messages", rateLimit(10, 60_000), async (req, res) => {
    const parsed = visitorMessageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Please write a message (up to 2000 characters)." });
    const { body, name, contact } = parsed.data;
    try {
      let conversation = await findConversationByToken(visitorToken(req));
      const isNew = !conversation;
      if (!conversation) {
        [conversation] = await db
          .insert(chatConversations)
          .values({ visitorToken: crypto.randomBytes(24).toString("base64url"), visitorName: name || null, visitorContact: contact || null })
          .returning();
      } else if ((name && !conversation.visitorName) || (contact && !conversation.visitorContact)) {
        [conversation] = await db
          .update(chatConversations)
          .set({ visitorName: conversation.visitorName || name || null, visitorContact: conversation.visitorContact || contact || null })
          .where(eq(chatConversations.id, conversation.id))
          .returning();
      }
      await db.insert(chatMessages).values({ conversationId: conversation.id, sender: "visitor", body });
      await db
        .update(chatConversations)
        .set({ lastMessageAt: new Date(), adminUnread: sql`${chatConversations.adminUnread} + 1` })
        .where(eq(chatConversations.id, conversation.id));
      notifyNewMessage(conversation.visitorName, conversation.visitorContact, body, isNew);
      res.status(201).json({ token: conversation.visitorToken, messages: await listMessages(conversation.id) });
    } catch (err) {
      console.error("Chat send failed:", err);
      res.status(500).json({ error: "Couldn't send your message. Please try again." });
    }
  });

  app.get("/api/chat/messages", async (req, res) => {
    try {
      const conversation = await findConversationByToken(visitorToken(req));
      if (!conversation) return res.status(404).json({ error: "Conversation not found" });
      res.json({ messages: await listMessages(conversation.id) });
    } catch (err) {
      console.error("Chat fetch failed:", err);
      res.status(500).json({ error: "Couldn't load messages" });
    }
  });

  app.get("/api/chat/admin/conversations", requireStaff, async (_req, res) => {
    try {
      // Written as raw SQL: drizzle renders an interpolated column unqualified ("id"), which inside
      // this subquery would bind to chat_messages.id instead of the outer conversation.
      const lastMessage = sql<string | null>`(SELECT m.body FROM chat_messages m WHERE m.conversation_id = chat_conversations.id ORDER BY m.created_at DESC LIMIT 1)`;
      const lastSender = sql<string | null>`(SELECT m.sender FROM chat_messages m WHERE m.conversation_id = chat_conversations.id ORDER BY m.created_at DESC LIMIT 1)`;
      const rows: ChatConversationSummary[] = await db
        .select({
          id: chatConversations.id,
          visitorName: chatConversations.visitorName,
          visitorContact: chatConversations.visitorContact,
          adminUnread: chatConversations.adminUnread,
          createdAt: chatConversations.createdAt,
          lastMessageAt: chatConversations.lastMessageAt,
          lastMessage,
          lastSender,
        })
        .from(chatConversations)
        .orderBy(desc(chatConversations.lastMessageAt))
        .limit(200);
      res.json(rows);
    } catch (err) {
      console.error("Chat list failed:", err);
      res.status(500).json({ error: "Couldn't load conversations" });
    }
  });

  app.get("/api/chat/admin/conversations/:id/messages", requireStaff, async (req, res) => {
    try {
      const id = String(req.params.id);
      await db.update(chatConversations).set({ adminUnread: 0 }).where(eq(chatConversations.id, id));
      res.json(await listMessages(id));
    } catch (err) {
      console.error("Chat admin fetch failed:", err);
      res.status(500).json({ error: "Couldn't load messages" });
    }
  });

  app.post("/api/chat/admin/conversations/:id/messages", requireStaff, async (req, res) => {
    const parsed = adminMessageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Message is empty or too long" });
    try {
      const id = String(req.params.id);
      const [conversation] = await db.select({ id: chatConversations.id }).from(chatConversations).where(eq(chatConversations.id, id));
      if (!conversation) return res.status(404).json({ error: "Conversation not found" });
      await db.insert(chatMessages).values({ conversationId: id, sender: "admin", body: parsed.data.body });
      await db.update(chatConversations).set({ lastMessageAt: new Date(), adminUnread: 0 }).where(eq(chatConversations.id, id));
      res.status(201).json(await listMessages(id));
    } catch (err) {
      console.error("Chat reply failed:", err);
      res.status(500).json({ error: "Couldn't send reply" });
    }
  });

  app.get("/api/chat/admin/telegram", requireStaff, (_req, res) => {
    res.json({ configured: telegramConfigured() });
  });

  app.post("/api/chat/admin/telegram/test", requireAdmin, async (_req, res) => {
    const result = await sendTelegram("✅ Test from einvite.me: live chat notifications are working.");
    res.status(result.ok ? 200 : 400).json(result);
  });
}
