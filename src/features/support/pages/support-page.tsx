"use client";

import * as React from "react";
import {
  Search,
  MessageCircle,
  ChevronRight,
  Send,
  ArrowLeft,
  HelpCircle,
  Mail,
  Wallet,
  Banknote,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/shared/components/layout";
import { Card, Input, Button, Separator } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/common";
import { SUPPORT_CATEGORIES, SUPPORT_TOPICS } from "@/shared/data";
import { cn } from "@/utils/cn";
import type { SupportTopic } from "@/shared/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet,
  Banknote,
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
};

type View = "browse" | "topic" | "chat";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
}

const AUTO_REPLIES: Record<string, string> = {
  default:
    "Thanks for reaching out! Our team typically responds within a few hours. For urgent issues, please email support@novacrust.com.",
  deposit: "Deposits usually arrive within a few minutes for crypto and 1–2 business days for bank transfers. Is there a specific deposit you're waiting on?",
  withdraw: "Withdrawals to banks take 1–2 business days, while mobile money and crypto withdrawals are usually instant. Can you share the transaction reference?",
  card: "You can freeze or unfreeze your card anytime from the Cards page. If your card was declined, please check your balance and limits.",
  verification: "Verification usually takes a few minutes after you upload your documents. If it's been longer, please share your email so we can look into it.",
};

function getReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("deposit") || t.includes("add money")) return AUTO_REPLIES.deposit;
  if (t.includes("withdraw") || t.includes("cash out")) return AUTO_REPLIES.withdraw;
  if (t.includes("card")) return AUTO_REPLIES.card;
  if (t.includes("verif") || t.includes("kyc") || t.includes("identity")) return AUTO_REPLIES.verification;
  return AUTO_REPLIES.default;
}

export function SupportPage() {
  const [view, setView] = React.useState<View>("browse");
  const [search, setSearch] = React.useState("");
  const [activeTopic, setActiveTopic] = React.useState<SupportTopic | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const filteredTopics = SUPPORT_TOPICS.filter((t) =>
    search ? t.title.toLowerCase().includes(search.toLowerCase()) : true,
  );

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function openTopic(topic: SupportTopic) {
    setActiveTopic(topic);
    setView("topic");
  }

  function startChat() {
    setMessages([
      {
        id: "1",
        role: "agent",
        text: "Hi! I'm Nova, your support assistant. How can I help you today?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setView("chat");
  }

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Simulated agent reply.
    setTimeout(() => {
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "agent",
        text: getReply(userMsg.text),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((m) => [...m, agentMsg]);
    }, 1000);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {view !== "browse" && (
          <button
            type="button"
            onClick={() => setView("browse")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Help center
          </button>
        )}

        {/* Browse */}
        {view === "browse" && (
          <div className="space-y-6 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Help & support</h2>
              <p className="text-sm text-muted-foreground">Find answers or talk to us.</p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for help…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Contact options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={startChat}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Chat with us</p>
                  <p className="text-xs text-muted-foreground">Usually replies in minutes</p>
                </div>
              </button>
              <a
                href="mailto:support@novacrust.com"
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-xs text-muted-foreground">support@novacrust.com</p>
                </div>
              </a>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Browse by category</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SUPPORT_CATEGORIES.map((cat) => {
                  const Icon = ICON_MAP[cat.icon] ?? HelpCircle;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSearch(cat.label)}
                      className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <p className="text-sm font-medium text-foreground">{cat.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Popular topics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Popular topics</h3>
              <Card className="overflow-hidden">
                {filteredTopics.length === 0 ? (
                  <EmptyState icon={HelpCircle} title="No topics found" description="Try a different search." />
                ) : (
                  <ul className="divide-y divide-border">
                    {filteredTopics.slice(0, 8).map((topic) => (
                      <li key={topic.id}>
                        <button
                          type="button"
                          onClick={() => openTopic(topic)}
                          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{topic.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{topic.category}</p>
                          </div>
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Topic detail */}
        {view === "topic" && activeTopic && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight text-foreground">{activeTopic.title}</h2>
              <p className="text-xs text-muted-foreground">{activeTopic.category}</p>
            </div>
            <Card className="p-5">
              <p className="text-sm leading-relaxed text-foreground">{activeTopic.content}</p>
            </Card>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Still need help?</p>
              <Button variant="outline" onClick={startChat}>
                <MessageCircle className="size-4" />
                Chat with support
              </Button>
            </div>
          </div>
        )}

        {/* Chat */}
        {view === "chat" && (
          <div className="flex flex-col gap-4 nc-animate-fade-in" style={{ minHeight: "60vh" }}>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                N
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Nova Support</p>
                <p className="text-xs text-success">● Online</p>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-card p-4 scrollbar-thin"
              style={{ maxHeight: "50vh" }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    <p>{m.text}</p>
                    <p className={cn("mt-1 text-[0.65rem]", m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message…"
                className="border-0 shadow-none focus-visible:ring-0"
              />
              <Button size="icon" onClick={sendMessage} disabled={!input.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              This is a simulated chat for demo purposes.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
