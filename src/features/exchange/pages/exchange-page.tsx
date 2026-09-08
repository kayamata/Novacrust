"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowDown, RefreshCw } from "lucide-react";
import { AppShell } from "@/shared/components/layout";
import { Card, Button, Label } from "@/shared/components/ui";
import {
  AmountInput,
  ReviewRow,
  ProcessingState,
  SuccessScreen,
  ErrorState,
  ConfirmDialog,
} from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { USD_RATES } from "@/shared/data";
import { formatCurrency } from "@/utils/format";
import type { CurrencyCode, Transaction } from "@/shared/types";

type Step = "form" | "review" | "processing" | "success" | "error";

const EXCHANGEABLE: CurrencyCode[] = ["USD", "NGN", "EUR", "GBP", "USDT", "USDC", "BTC", "ETH"];

export function ExchangePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { assets, exchange } = useAppStore();

  const [step, setStep] = React.useState<Step>("form");

  // Pre-select "from" currency from query param if provided.
  const currencyParam = searchParams.get("currency") as CurrencyCode | null;
  const [from, setFrom] = React.useState<CurrencyCode>(currencyParam ?? "USD");
  const [to, setTo] = React.useState<CurrencyCode>(
    currencyParam === "NGN" ? "USD" : "NGN",
  );
  const [amount, setAmount] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [completedTx, setCompletedTx] = React.useState<Transaction | null>(null);

  const fromAsset = assets.find((a) => a.code === from);
  const amountNum = parseFloat(amount) || 0;
  const rate = (USD_RATES[to] ?? 1) / (USD_RATES[from] ?? 1);
  const toAmount = amountNum * rate;
  const fee = 0;

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function validate(): string | null {
    if (!amountNum || amountNum <= 0) return "Please enter a valid amount.";
    if (!fromAsset || amountNum > fromAsset.balance) return "Insufficient balance.";
    if (from === to) return "Please choose different currencies.";
    return null;
  }

  async function confirmExchange() {
    setStep("processing");
    setError(null);
    try {
      const tx = await exchange({ from, to, amount: amountNum });
      setCompletedTx(tx);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  if (step === "processing") {
    return (
      <AppShell>
        <ProcessingState title="Exchanging…" description="Please don't close this window." />
      </AppShell>
    );
  }

  if (step === "success" && completedTx) {
    return (
      <AppShell>
        <SuccessScreen
          title="Exchange complete"
          amount={`${formatCurrency(completedTx.fromAmount ?? amountNum, completedTx.fromCurrency ?? from)} → ${formatCurrency(completedTx.toAmount ?? toAmount, completedTx.toCurrency ?? to)}`}
          description={`Rate: 1 ${completedTx.fromCurrency ?? from} = ${(completedTx.exchangeRate ?? rate).toLocaleString()} ${completedTx.toCurrency ?? to}`}
          primaryActionLabel="View transaction"
          primaryActionHref={ROUTES.transactionDetails(completedTx.id)}
          secondaryActionLabel="Done"
          secondaryActionHref={ROUTES.dashboard}
        />
      </AppShell>
    );
  }

  if (step === "error") {
    return (
      <AppShell>
        <div className="mx-auto max-w-md">
          <ErrorState
            description={error ?? "We couldn't complete this exchange."}
            onAction={() => {
              setStep("form");
              setError(null);
            }}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Exchange</h2>
          <p className="text-sm text-muted-foreground">Swap between currencies instantly.</p>
        </div>

        {/* From */}
        <div className="space-y-1.5">
          <Label>From</Label>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <CurrencyPicker value={from} onChange={setFrom} />
            <AmountInput
              value={amount}
              onChange={setAmount}
              symbol={currencySymbol(from)}
              placeholder="0.00"
              max={fromAsset?.balance.toFixed(2)}
              onMax={() => fromAsset && setAmount(fromAsset.balance.toString())}
            />
            {fromAsset && (
              <p className="text-xs text-muted-foreground">
                Available: {formatCurrency(fromAsset.balance, from)}
              </p>
            )}
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center -my-2">
          <button
            type="button"
            onClick={swap}
            className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            aria-label="Swap currencies"
          >
            <ArrowDown className="size-4" />
          </button>
        </div>

        {/* To */}
        <div className="space-y-1.5">
          <Label>To</Label>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <CurrencyPicker value={to} onChange={setTo} />
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-2xl font-semibold text-muted-foreground">{currencySymbol(to)}</span>
              <span className="flex-1 text-2xl font-semibold tabular-nums text-foreground">
                {toAmount > 0 ? toAmount.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "0.00"}
              </span>
            </div>
          </div>
        </div>

        {/* Summary */}
        {amountNum > 0 && (
          <Card className="p-4">
            <ReviewRow label="Rate" value={`1 ${from} = ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to}`} />
            <ReviewRow label="Fee" value={formatCurrency(fee, from)} />
            <ReviewRow label="You receive" value={formatCurrency(toAmount, to)} emphasize />
          </Card>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          className="w-full"
          onClick={() => {
            const err = validate();
            if (err) {
              setError(err);
              return;
            }
            setError(null);
            setStep("review");
          }}
        >
          <RefreshCw className="size-4" />
          Review exchange
        </Button>
      </div>

      {step === "review" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setStep("form")}>
          <div className="w-full max-w-md rounded-2xl bg-background p-5 nc-animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">Review exchange</h3>
              <p className="text-sm text-muted-foreground">Check the details before confirming.</p>
            </div>
            <Card className="mt-4 p-4">
              <ReviewRow label="From" value={formatCurrency(amountNum, from)} emphasize />
              <ReviewRow label="To" value={formatCurrency(toAmount, to)} emphasize />
              <ReviewRow label="Rate" value={`1 ${from} = ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to}`} />
              <ReviewRow label="Fee" value={formatCurrency(fee, from)} />
            </Card>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setConfirmOpen(true)}>
                Confirm exchange
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm exchange?"
        description={`${formatCurrency(amountNum, from)} → ${formatCurrency(toAmount, to)}.`}
        confirmLabel="Confirm"
        onConfirm={confirmExchange}
      />
    </AppShell>
  );
}

function currencySymbol(code: CurrencyCode): string {
  const map: Record<CurrencyCode, string> = {
    USD: "$", NGN: "₦", EUR: "€", GBP: "£", GHS: "₵", KES: "KSh",
    USDT: "$", USDC: "$", BTC: "₿", ETH: "Ξ", SOL: "◎", CRYPTO: "$",
  };
  return map[code] ?? "";
}

function CurrencyPicker({
  value,
  onChange,
}: {
  value: CurrencyCode;
  onChange: (c: CurrencyCode) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CurrencyCode)}
      className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {EXCHANGEABLE.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}
