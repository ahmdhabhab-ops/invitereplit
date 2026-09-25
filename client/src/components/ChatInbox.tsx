import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { ChatConversationSummary, ChatMessage } from "@shared/schema";

const CONVERSATIONS_KEY = ["/api/chat/admin/conversations"];

export function ChatInbox({ canTestTelegram }: { canTestTelegram: boolean }) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [], isLoading } = useQuery<ChatConversationSummary[]>({
    queryKey: CONVERSATIONS_KEY,
    refetchInterval: 5000,
  });

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/admin/conversations", selectedId, "messages"],
    enabled: !!selectedId,
    refetchInterval: 3000,
  });

  const { data: telegram } = useQuery<{ configured: boolean }>({ queryKey: ["/api/chat/admin/telegram"] });

  const selected = conversations.find((c) => c.id === selectedId);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length, selectedId]);

  const sendReply = useMutation({
    mutationFn: async (body: string) => (await apiRequest("POST", `/api/chat/admin/conversations/${selectedId}/messages`, { body })).json(),
    onSuccess: (updated: ChatMessage[]) => {
      queryClient.setQueryData(["/api/chat/admin/conversations", selectedId, "messages"], updated);
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
      setReply("");
    },
    onError: () => toast({ title: "Couldn't send reply", variant: "destructive" }),
  });

  const testTelegram = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/chat/admin/telegram/test", { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");
    },
    onSuccess: () => toast({ title: "Test message sent to Telegram" }),
    onError: (err: Error) => toast({ title: "Telegram test failed", description: err.message, variant: "destructive" }),
  });

  const submitReply = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (reply.trim() && selectedId) sendReply.mutate(reply.trim());
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span>
            Telegram notifications:{" "}
            {telegram?.configured ? (
              <Badge className="bg-green-100 text-green-800">On</Badge>
            ) : (
              <Badge variant="secondary">Not set up: add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Dokploy → Environment</Badge>
            )}
          </span>
          {canTestTelegram && telegram?.configured && (
            <Button variant="outline" size="sm" onClick={() => testTelegram.mutate()} disabled={testTelegram.isPending} data-testid="button-telegram-test">
              {testTelegram.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send test message
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="grid h-[70vh] md:grid-cols-[320px_1fr]">
          <div className={`overflow-y-auto border-r border-border ${selectedId ? "hidden md:block" : ""}`} data-testid="chat-conversation-list">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <MessageSquare className="mx-auto mb-3 h-8 w-8" />
                No chats yet. Messages from the website will appear here.
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`block w-full border-b border-border px-4 py-3 text-left hover:bg-muted/60 ${c.id === selectedId ? "bg-muted" : ""}`}
                  data-testid={`chat-conversation-${c.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{c.visitorName || "Website visitor"}</span>
                    {c.adminUnread > 0 && <Badge className="shrink-0">{c.adminUnread}</Badge>}
                  </div>
                  {c.visitorContact && <p className="truncate text-xs text-muted-foreground">{c.visitorContact}</p>}
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {c.lastSender === "admin" ? "You: " : ""}
                    {c.lastMessage}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(c.lastMessageAt), { addSuffix: true })}</p>
                </button>
              ))
            )}
          </div>

          <div className={`flex min-h-0 flex-col ${selectedId ? "" : "hidden md:flex"}`}>
            {!selected ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Select a chat to read and reply</div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedId(null)}>Back</Button>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{selected.visitorName || "Website visitor"}</p>
                    <p className="truncate text-xs text-muted-foreground">{selected.visitorContact || "No contact left"}</p>
                  </div>
                </div>
                <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4" data-testid="chat-admin-messages">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${m.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {m.body}
                        <div className="mt-1 text-[10px] opacity-70">{new Date(m.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={submitReply} className="flex gap-2 border-t border-border p-3">
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) submitReply(e);
                    }}
                    placeholder="Type a reply… (Enter to send, Shift+Enter for a new line)"
                    rows={2}
                    maxLength={2000}
                    className="resize-none"
                    data-testid="input-chat-reply"
                  />
                  <Button type="submit" disabled={sendReply.isPending || !reply.trim()} data-testid="button-chat-reply">
                    {sendReply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
