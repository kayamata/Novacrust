"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, RefreshCw, Banknote } from "lucide-react";
import { AppShell } from "@/shared/components/layout";
import { Card, Button } from "@/shared/components/ui";
import { AssetIcon, TransactionItem, EmptyState, SectionHeader } from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { formatCurrency, formatPercent } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { CurrencyCode } from "@/shared/types";

const ACTIONS = [
  { icon: ArrowUpRight, label: "Send", href: ROUTES.send },
  { icon: ArrowDownLeft, label: "Receive", href: ROUTES.receive },
  { icon: RefreshCw, label: "Convert", href: ROUTES.exchange },
  { icon: Banknote, label: "Withdraw", href: ROUTES.withdraw },
];

export function AssetDetailPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { getAsset, getTransactionsForAsset, hydrated } = useAppStore();

  const code = (params?.code?.toUpperCase() ?? "") as CurrencyCode;
  const asset = getAsset(code);
  const transactions = getTransactionsForAsset(code);

  if (!hydrated) {
    return (
      <AppShell>
        <div className="space-y-4">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        </div>
      </AppShell>
    );
  }

  if (!asset) {
    return (
      <AppShell>
        <EmptyState
          title="Asset not found"
          description="This asset doesn't exist in your wallet."
          action={
            <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.wallet)}>
              Back to wallet
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push(ROUTES.wallet)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Wallet
        </button>

        {/* Asset header */}
        <div className="flex items-center gap-4">
          <AssetIcon asset={asset} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">{asset.code}</h2>
            <p className="text-sm text-muted-foreground">{asset.name}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {formatCurrency(asset.balance, asset.code)}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {formatCurrency(asset.usdValue, "USD")} USD
            </p>
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                asset.change24h >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {formatPercent(asset.change24h)} 24h
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-4 gap-2">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Button
                key={a.label}
                variant="outline"
                className="flex flex-col items-center gap-1.5 py-3"
                onClick={() => router.push(a.href)}
              >
                <Icon className="size-5" />
                <span className="text-xs">{a.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Recent activity for this asset */}
        <div className="space-y-3">
          <SectionHeader title="Recent activity" />
          <Card className="overflow-hidden">
            {transactions.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Transactions for this asset will appear here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {transactions.slice(0, 10).map((tx) => (
                  <li key={tx.id}>
                    <TransactionItem
                      transaction={tx}
                      onClick={() => router.push(ROUTES.transactionDetails(tx.id))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
