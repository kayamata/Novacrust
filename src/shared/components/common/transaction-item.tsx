"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  CreditCard,
  Wallet,
  Banknote,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { formatCurrency, formatDate, truncateAddress } from "@/utils/format";
import type { Transaction } from "@/shared/types";

const ICON_FOR: Record<Transaction["type"], React.ComponentType<{ className?: string }>> = {
  received: ArrowDownLeft,
  sent: ArrowUpRight,
  exchange: RefreshCw,
  withdrawal: Banknote,
  deposit: Wallet,
  card: CreditCard,
  fee: ArrowUpRight,
};

const COLOR_FOR: Record<Transaction["direction"], string> = {
  in: "bg-success/10 text-success",
  out: "bg-muted text-muted-foreground",
  neutral: "bg-primary/10 text-primary",
};

/**
 * A single transaction row — used in lists on the dashboard, wallet, and
 * transactions pages.
 */
export function TransactionItem({
  transaction,
  onClick,
  showDate = true,
  className,
}: {
  transaction: Transaction;
  onClick?: () => void;
  showDate?: boolean;
  className?: string;
}) {
  const Icon = ICON_FOR[transaction.type];
  const isPositive = transaction.direction === "in";
  const amountPrefix = isPositive ? "+" : transaction.direction === "out" ? "-" : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/60",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          COLOR_FOR[transaction.direction],
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {transaction.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {transaction.subtitle ??
            (transaction.counterparty
              ? `${transaction.counterparty.name}${
                  transaction.counterparty.detail
                    ? ` · ${truncateAddress(transaction.counterparty.detail, 4)}`
                    : ""
                }`
              : formatDate(transaction.date, "datetime"))}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            isPositive ? "text-success" : "text-foreground",
          )}
        >
          {amountPrefix}
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
        {showDate && (
          <p className="text-xs text-muted-foreground">
            {formatDate(transaction.date, "relative")}
          </p>
        )}
      </div>
    </button>
  );
}
