"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/shared/components/ui";
import { AssetIcon } from "@/shared/components/common";
import { ROUTES } from "@/utils/constants";
import { formatCurrency, formatPercent } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Asset } from "@/shared/types";

export function BalancesList({ assets }: { assets: Asset[] }) {
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-border">
        {assets.map((asset) => (
          <li key={asset.code}>
            <Link
              href={ROUTES.walletAsset(asset.code)}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/50"
            >
              <AssetIcon asset={asset} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{asset.code}</p>
                <p className="truncate text-xs text-muted-foreground">{asset.name}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(asset.balance, asset.code)}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(asset.usdValue, "USD")}
                  </p>
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
          </li>
        ))}
      </ul>
    </Card>
  );
}
