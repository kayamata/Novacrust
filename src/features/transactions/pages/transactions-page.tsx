"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Receipt } from "lucide-react";
import { AppShell } from "@/shared/components/layout";
import { Card, Input, Tabs, TabsList, TabsTrigger, TabsContent, Button } from "@/shared/components/ui";
import { TransactionItem, EmptyState, TransactionListSkeleton } from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import type { TransactionType } from "@/shared/types";

const FILTERS: { id: TransactionType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "received", label: "Received" },
  { id: "sent", label: "Sent" },
  { id: "exchange", label: "Exchange" },
  { id: "withdrawal", label: "Withdrawals" },
  { id: "deposit", label: "Deposits" },
  { id: "card", label: "Cards" },
];

export function TransactionsPage() {
  const router = useRouter();
  const { transactions, hydrated } = useAppStore();
  const [filter, setFilter] = React.useState<TransactionType | "all">("all");
  const [search, setSearch] = React.useState("");

  const filtered = transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.subtitle?.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.counterparty?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Search */}
        <div className="relative nc-animate-fade-in">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as TransactionType | "all")}>
          <TabsList className="w-full justify-start overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => (
              <TabsTrigger key={f.id} value={f.id}>
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {!hydrated ? (
              <Card className="overflow-hidden">
                <TransactionListSkeleton count={8} />
              </Card>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No transactions found"
                description={
                  search
                    ? "Try a different search term."
                    : "Your transactions will appear here once you start moving money."
                }
                action={
                  !search && (
                    <Button size="sm" onClick={() => router.push(ROUTES.deposit)}>
                      Add money
                    </Button>
                  )
                }
              />
            ) : (
              <Card className="overflow-hidden">
                <ul className="divide-y divide-border nc-animate-fade-in">
                  {filtered.map((tx) => (
                    <li key={tx.id}>
                      <TransactionItem
                        transaction={tx}
                        onClick={() => router.push(ROUTES.transactionDetails(tx.id))}
                      />
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
