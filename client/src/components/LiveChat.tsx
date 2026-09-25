import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { isValidContact } from "@shared/contact";

type Message = { id: string; sender: "visitor" | "admin"; body: string; createdAt: string };

const TOKEN_KEY = "einvite_chat_token";
const SEEN_KEY = "einvite_chat_seen_admin";

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked (private mode); the chat still works for this page view.
  }
}

export function LiveChat() {
  const { t } = useLanguage();
  const tc = t.chat;
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(() => readStorage(TOKEN_KEY));
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenAdmin, setSeenAdmin] = useState(() => Number(readStorage(SEEN_KEY) || 0));
  const listRef = useRef<HTMLDivElement>(null);

  const adminCount = messages.filter((m) => m.sender === "admin").length;
  const unread = open ? 0 : Math.max(0, adminCount - seenAdmin);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/chat/messages", { headers: { "X-Chat-Token": token } });
      if (res.status === 404) {
        writeStorage(TOKEN_KEY, null);
        setToken(null);
        setMessages([]);
        return;
      }
      if (res.ok) setMessages((await res.json()).messages);
    } catch {
      // Network blip; the next poll will retry.
    }
  }, [token]);

  useEffect(() => {
    refresh();
    if (!token) return;
    const id = setInterval(refresh, open ? 4000 : 30000);
    return () => clearInterval(id);
  }, [refresh, token, open]);

  useEffect(() => {
    if (!open) return;
    setSeenAdmin(adminCount);
    writeStorage(SEEN_KEY, String(adminCount));
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [open, messages.length, adminCount]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    if (!token && !isValidContact(contact)) {
      setError(tc.contactRequired);
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { "X-Chat-Token": token } : {}) },
        body: JSON.stringify({ body, name: name.trim() || undefined, contact: contact.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || tc.error);
        return;
      }
      const data = await res.json();
      writeStorage(TOKEN_KEY, data.token);
      setToken(data.token);
      setMessages(data.messages);
      setDraft("");
    } catch {
      setError(tc.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            style={{ height: "min(520px, 70vh)" }}
            role="dialog"
            aria-label={tc.title}
            data-testid="live-chat-panel"
          >
            <div className="flex items-start justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground">
              <div>
                <p className="font-semibold">{tc.title}</p>
                <p className="text-xs opacity-80">{tc.subtitle}</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-white/15" aria-label="Close chat" data-testid="button-close-chat">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4" data-testid="live-chat-messages">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">{tc.greeting}</div>
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "visitor" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                      m.sender === "visitor" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="space-y-2 border-t border-border p-3">
              {!token && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={tc.namePlaceholder} maxLength={80} className="h-9 text-sm" data-testid="input-chat-name" />
                    <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={tc.contactPlaceholder} maxLength={120} required aria-required="true" className="h-9 text-sm" data-testid="input-chat-contact" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{tc.contactHint}</p>
                </>
              )}
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={tc.messagePlaceholder}
                  maxLength={2000}
                  className="h-10"
                  autoFocus
                  data-testid="input-chat-message"
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={sending || !draft.trim()} aria-label={tc.send} data-testid="button-chat-send">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        aria-label={tc.open}
        title={tc.open}
        data-testid="button-open-chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
