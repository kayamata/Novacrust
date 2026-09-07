"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Settings as SettingsIcon,
  CreditCard,
  Globe,
  Gift,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui";
import { Input } from "@/shared/components/ui";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { CurrencyCode } from "@/shared/types";

interface SearchItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  keywords: string;
}

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { assets, transactions, recipients } = useAppStore();
  const [query, setQuery] = React.useState("");

  // Keyboard shortcut: "/" to open search.
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !open && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        onOpenChange(true);
      }
      if (e.key === "Escape" && open) onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const items: SearchItem[] = React.useMemo(() => {
    const assetItems: SearchItem[] = assets.map((a) => ({
      id: `asset_${a.code}`,
      label: `${a.code} wallet`,
      description: `${formatCurrency(a.balance, a.code as CurrencyCode)} · ${a.name}`,
      href: ROUTES.walletAsset(a.code),
      icon: Wallet,
      category: "Assets",
      keywords: `${a.code} ${a.name} wallet balance`.toLowerCase(),
    }));

    const txItems: SearchItem[] = transactions.slice(0, 12).map((t) => ({
      id: `tx_${t.id}`,
      label: t.title,
      description: `${formatCurrency(t.amount, t.currency)} · ${formatDate(t.date, "datetime")}`,
      href: ROUTES.transactions,
      icon: t.direction === "in" ? ArrowDownLeft : t.direction === "out" ? ArrowUpRight : Receipt,
      category: "Transactions",
      keywords: `${t.title} ${t.subtitle ?? ""} ${t.reference} ${t.currency}`.toLowerCase(),
    }));

    const recipientItems: SearchItem[] = recipients.map((r) => ({
      id: `rcp_${r.id}`,
      label: r.name,
      description: `${r.country} · ${r.currency}`,
      href: ROUTES.send,
      icon: ArrowUpRight,
      category: "Recipients",
      keywords: `${r.name} ${r.country} ${r.bank ?? ""} ${r.accountNumber ?? ""}`.toLowerCase(),
    }));

    const navItems: SearchItem[] = [
      { id: "nav_send", label: "Send money", description: "Move money to someone", href: ROUTES.send, icon: ArrowUpRight, category: "Navigate", keywords: "send money transfer" },
      { id: "nav_receive", label: "Receive money", description: "Get paid via crypto or bank", href: ROUTES.receive, icon: ArrowDownLeft, category: "Navigate", keywords: "receive money deposit" },
      { id: "nav_exchange", label: "Exchange currency", description: "Swap between currencies", href: ROUTES.exchange, icon: RefreshCw, category: "Navigate", keywords: "exchange convert currency swap" },
      { id: "nav_cards", label: "Cards", description: "Your virtual cards", href: ROUTES.cards, icon: CreditCard, category: "Navigate", keywords: "card virtual" },
      { id: "nav_global", label: "Global account", description: "USD / EUR / GBP accounts", href: ROUTES.globalAccount, icon: Globe, category: "Navigate", keywords: "global account usd eur gbp" },
      { id: "nav_gift", label: "Gift cards", description: "Buy and sell gift cards", href: ROUTES.giftCards, icon: Gift, category: "Navigate", keywords: "gift card buy sell amazon" },
      { id: "nav_transactions", label: "Transactions", description: "Full transaction history", href: ROUTES.transactions, icon: Receipt, category: "Navigate", keywords: "transactions history" },
      { id: "nav_settings", label: "Settings", description: "Profile, security, preferences", href: ROUTES.settings, icon: SettingsIcon, category: "Navigate", keywords: "settings profile security" },
    ];

    return [...assetItems, ...txItems, ...recipientItems, ...navItems];
  }, [assets, transactions, recipients]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Show a curated default set when no query.
      return items.filter((i) => i.category === "Navigate").slice(0, 6);
    }
    return items.filter((i) => i.keywords.includes(q) || i.label.toLowerCase().includes(q)).slice(0, 12);
  }, [items, query]);

  // Group results by category.
  const grouped = React.useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    for (const item of filtered) {
      const arr = map.get(item.category) ?? [];
      arr.push(item);
      map.set(item.category, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function handleOpenChange(next: boolean) {
    if (!next) setQuery("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="top-[15%] max-w-lg translate-y-0 gap-0 p-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search across transactions, assets, recipients and settings.
        </DialogDescription>
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="size-5 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions, assets, recipients…"
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-2">
          {grouped.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No results</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching for an asset, transaction or page.
              </p>
            </div>
          ) : (
            grouped.map(([category, list]) => (
              <div key={category} className="py-1">
                <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {category}
                </div>
                {list.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => go(item.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted",
                      )}
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.label}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
