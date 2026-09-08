"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/layout";
import {
  SectionHeader,
  QuickActionsSkeleton,
  BalanceListSkeleton,
  TransactionListSkeleton,
} from "@/shared/components/common";
import { Card } from "@/shared/components/ui";
import { useAppStore, useAuth } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { getGreeting } from "@/utils/format";
import type { Asset } from "@/shared/types";
import { BalanceCarousel } from "@/features/dashboard/components/balance-carousel";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { BalancesList } from "@/features/dashboard/components/balances-list";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";

export function DashboardPage() {
  const router = useRouter();
  const { user, hydrated: authHydrated } = useAuth();
  const {
    assets,
    transactions,
    hydrated: storeHydrated,
  } = useAppStore();

  const loading = !authHydrated || !storeHydrated;
  const firstName = user?.firstName ?? "there";

  // Carousel: NGN → USD → GBP → combined Crypto balance (last).
  const fiatOrder: Asset["code"][] = ["NGN", "USD", "GBP"];
  const fiatAssets = fiatOrder
    .map((code) => assets.find((a) => a.code === code))
    .filter((a): a is Asset => Boolean(a));
  const cryptoAssets = assets.filter((a) => a.kind !== "cash");
  const cryptoUsdTotal = cryptoAssets.reduce((sum, a) => sum + a.usdValue, 0);
  const cryptoAsset: Asset = {
    code: "CRYPTO",
    name: "Crypto Balance",
    kind: "crypto",
    balance: cryptoUsdTotal,
    usdValue: cryptoUsdTotal,
    change24h: 0,
    symbol: "$",
    subtitle: "All crypto assets",
    glyph: "🪙",
    color: "bg-indigo-500",
  };
  const carouselAssets = [...fiatAssets, cryptoAsset];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Greeting */}
        <div className="nc-animate-fade-in">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {getGreeting()}, {firstName} 👋
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your money.
          </p>
        </div>

        {/* Balance carousel — main visual focus (fiat accounts only) */}
        <div className="nc-animate-fade-in">
          <BalanceCarousel assets={carouselAssets} loading={loading} />
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <SectionHeader title="What would you like to do?" />
          {loading ? <QuickActionsSkeleton /> : <QuickActions />}
        </div>

        {/* Balances + Recent activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <SectionHeader title="Your balances" />
            {loading ? (
              <Card className="overflow-hidden">
                <BalanceListSkeleton count={5} />
              </Card>
            ) : (
              <BalancesList assets={assets} />
            )}
          </div>
          <div className="space-y-3">
            <SectionHeader
              title="Recent activity"
              action={
                !loading && (
                  <button
                    type="button"
                    onClick={() => router.push(ROUTES.transactions)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View all
                  </button>
                )
              }
            />
            {loading ? (
              <Card className="overflow-hidden">
                <TransactionListSkeleton count={5} />
              </Card>
            ) : (
              <RecentActivity
                transactions={transactions}
                onSelect={(id) => router.push(ROUTES.transactionDetails(id))}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
