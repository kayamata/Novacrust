"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/shared/components/layout";
import { Card, Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui";
import { AssetIcon, EmptyState, BalanceListSkeleton } from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { formatCurrency, formatPercent } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Asset } from "@/shared/types";

function AssetRow({ asset }: { asset: Asset }) {
  return (
    <Link
      href={ROUTES.walletAsset(asset.code)}
      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50"
    >
      <AssetIcon asset={asset} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{asset.code}</p>
        <p className="truncate text-xs text-muted-foreground">{asset.subtitle ?? asset.name}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {formatCurrency(asset.balance, asset.code)}
        </p>
        <div className="flex items-center justify-end gap-1.5">
          <p className="text-xs text-muted-foreground">{formatCurrency(asset.usdValue, "USD")}</p>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              asset.change24h >= 0 ? "text-success" : "text-destructive",
            )}
          >
            {formatPercent(asset.change24h)}
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function WalletPage() {
  const { assets, hydrated } = useAppStore();
  const [tab, setTab] = React.useState<"all" | "cash" | "crypto">("all");

  const filtered = assets.filter((a) => {
    if (tab === "all") return true;
    if (tab === "cash") return a.kind === "cash";
    return a.kind === "crypto" || a.kind === "stablecoin";
  });

  const totalUsd = assets.reduce((sum, a) => sum + a.usdValue, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Summary */}
        <div className="rounded-2xl border border-border bg-card p-5 nc-animate-fade-in">
          <p className="text-sm text-muted-foreground">Total wallet value</p>
          {hydrated ? (
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(totalUsd, "USD")}
            </p>
          ) : (
            <div className="mt-2 h-8 w-40 animate-pulse rounded bg-muted" />
          )}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="cash">Cash</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <Card className="overflow-hidden">
              {!hydrated ? (
                <BalanceListSkeleton count={6} />
              ) : filtered.length === 0 ? (
                <EmptyState
                  title="No assets here yet"
                  description="Assets you hold will appear in this list."
                />
              ) : (
                <ul className="divide-y divide-border nc-animate-fade-in">
                  {filtered.map((asset) => (
                    <li key={asset.code}>
                      <AssetRow asset={asset} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
