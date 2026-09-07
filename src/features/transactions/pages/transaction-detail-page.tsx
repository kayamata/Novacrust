"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  CreditCard,
  Wallet,
  Banknote,
  Check,
  Clock,
  X,
  Download,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/shared/components/layout";
import { Card, Button, Separator, Badge } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { formatCurrency, formatDate, truncateAddress } from "@/utils/format";
import { cn } from "@/utils/cn";
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

const STATUS_BADGE: Record<Transaction["status"], { label: string; variant: "default" | "secondary" | "outline" }> = {
  completed: { label: "Completed", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  failed: { label: "Failed", variant: "outline" },
};

export function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { getTransaction } = useAppStore();

  const foundTx = getTransaction(params?.id ?? "");

  if (!foundTx) {
    return (
      <AppShell>
        <EmptyState
          title="Transaction not found"
          description="This transaction doesn't exist."
          action={
            <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.transactions)}>
              Back to transactions
            </Button>
          }
        />
      </AppShell>
    );
  }

  const tx = foundTx;
  const Icon = ICON_FOR[tx.type];
  const isPositive = tx.direction === "in";
  const amountPrefix = isPositive ? "+" : tx.direction === "out" ? "-" : "";
  const status = STATUS_BADGE[tx.status];

  function downloadReceipt() {
    const receipt = `
NOVACRUST — TRANSACTION RECEIPT
================================

Reference:    ${tx.reference}
Type:         ${tx.title}
Status:       ${tx.status}
Date:         ${formatDate(tx.date, "long")}

Amount:       ${amountPrefix}${formatCurrency(tx.amount, tx.currency)}
USD value:    ${formatCurrency(tx.usdValue, "USD")}
${tx.fee ? `Fee:          ${formatCurrency(tx.fee, tx.feeCurrency ?? tx.currency)}\n` : ""}
${tx.counterparty ? `Counterparty: ${tx.counterparty.name}${tx.counterparty.detail ? ` (${tx.counterparty.detail})` : ""}\n` : ""}
${tx.network ? `Network:      ${tx.network}\n` : ""}
${tx.exchangeRate ? `Rate:         1 ${tx.fromCurrency} = ${tx.exchangeRate.toLocaleString()} ${tx.toCurrency}\n` : ""}

This is a simulated receipt from the Novacrust demo.
Novacrust is a financial technology company, not a bank.
`;
    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `novacrust-${tx.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded.");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <button
          type="button"
          onClick={() => router.push(ROUTES.transactions)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Transactions
        </button>

        {/* Status + amount */}
        <Card className="p-6 text-center">
          <div
            className={cn(
              "mx-auto flex size-14 items-center justify-center rounded-full",
              COLOR_FOR[tx.direction],
            )}
          >
            <Icon className="size-6" />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{tx.title}</p>
          <p
            className={cn(
              "mt-1 text-3xl font-bold tracking-tight",
              isPositive ? "text-success" : "text-foreground",
            )}
          >
            {amountPrefix}
            {formatCurrency(tx.amount, tx.currency)}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant={status.variant}>
              {tx.status === "completed" && <Check className="size-3" />}
              {tx.status === "pending" && <Clock className="size-3" />}
              {tx.status === "failed" && <X className="size-3" />}
              {status.label}
            </Badge>
          </div>
        </Card>

        {/* Details */}
        <Card className="p-4">
          <div className="space-y-3">
            <DetailRow label="Date" value={formatDate(tx.date, "long")} />
            <Separator />
            <DetailRow label="Reference" value={tx.reference} />
            <Separator />
            {tx.counterparty && (
              <>
                <DetailRow
                  label={tx.direction === "in" ? "From" : "To"}
                  value={tx.counterparty.name}
                />
                {tx.counterparty.detail && (
                  <>
                    <Separator />
                    <DetailRow
                      label="Detail"
                      value={truncateAddress(tx.counterparty.detail, 8)}
                    />
                  </>
                )}
                <Separator />
              </>
            )}
            {tx.network && (
              <>
                <DetailRow label="Network" value={tx.network} />
                <Separator />
              </>
            )}
            {tx.exchangeRate && (
              <>
                <DetailRow
                  label="Exchange rate"
                  value={`1 ${tx.fromCurrency} = ${tx.exchangeRate.toLocaleString()} ${tx.toCurrency}`}
                />
                <Separator />
              </>
            )}
            {tx.fee !== undefined && (
              <>
                <DetailRow
                  label="Fee"
                  value={formatCurrency(tx.fee, tx.feeCurrency ?? tx.currency)}
                />
                <Separator />
              </>
            )}
            <DetailRow label="USD value" value={formatCurrency(tx.usdValue, "USD")} />
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={downloadReceipt}>
            <Download className="size-4" />
            Download receipt
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(tx.reference);
              toast.success("Reference copied.");
            }}
          >
            <Copy className="size-4" />
            Copy reference
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
