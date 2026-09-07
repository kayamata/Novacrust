"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Smartphone, Wallet } from "lucide-react";
import { AppShell } from "@/shared/components/layout";
import { Card, Button, Label, Input } from "@/shared/components/ui";
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
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { CurrencyCode, Recipient, Transaction } from "@/shared/types";

type Mode = "choose" | "form" | "review" | "processing" | "success" | "error";
type Method = "bank" | "mobile" | "crypto";

const METHODS: { id: Method; icon: React.ComponentType<{ className?: string }>; label: string; desc: string }[] = [
  { id: "bank", icon: Banknote, label: "Bank account", desc: "1–2 business days" },
  { id: "mobile", icon: Smartphone, label: "Mobile money", desc: "Usually within minutes" },
  { id: "crypto", icon: Wallet, label: "Crypto wallet", desc: "Instant" },
];

export function WithdrawPage() {
  const router = useRouter();
  const { assets, withdraw } = useAppStore();

  const [mode, setMode] = React.useState<Mode>("choose");
  const [method, setMethod] = React.useState<Method>("bank");
  const [fromCurrency, setFromCurrency] = React.useState<CurrencyCode>("USD");
  const [amount, setAmount] = React.useState("");
  const [recipientName, setRecipientName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [completedTx, setCompletedTx] = React.useState<Transaction | null>(null);

  const asset = assets.find((a) => a.code === fromCurrency);
  const amountNum = parseFloat(amount) || 0;
  const fee = method === "bank" ? 2.5 : 1.5;
  const total = amountNum + fee;
  const rate = fromCurrency === "USD" ? 1470 : 1;
  const receiveAmount = amountNum * rate;

  function validate(): string | null {
    if (!amountNum || amountNum <= 0) return "Please enter a valid amount.";
    if (!asset || total > asset.balance) return "Insufficient balance for this withdrawal.";
    if (!recipientName.trim()) return "Please enter the recipient name.";
    if (!accountNumber.trim()) return "Please enter the account/wallet details.";
    return null;
  }

  async function confirmWithdraw() {
    const recipient: Recipient = {
      id: "tmp",
      name: recipientName.trim(),
      accountNumber: accountNumber.trim(),
      country: "Nigeria",
      countryCode: "NG",
      currency: "NGN",
      saved: false,
      avatarColor: "bg-amber-500",
    };
    setMode("processing");
    setError(null);
    try {
      const tx = await withdraw({
        fromCurrency,
        amount: amountNum,
        method,
        recipient,
      });
      setCompletedTx(tx);
      setMode("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMode("error");
    }
  }

  if (mode === "processing") {
    return (
      <AppShell>
        <ProcessingState title="Processing withdrawal…" description="Please don't close this window." />
      </AppShell>
    );
  }

  if (mode === "success" && completedTx) {
    return (
      <AppShell>
        <SuccessScreen
          title="Withdrawal successful"
          amount={formatCurrency(completedTx.amount, completedTx.currency)}
          description={`To ${completedTx.counterparty?.name}. Funds typically arrive ${method === "bank" ? "within 1–2 business days" : "within minutes"}.`}
          primaryActionLabel="View transaction"
          primaryActionHref={ROUTES.transactionDetails(completedTx.id)}
          secondaryActionLabel="Done"
          secondaryActionHref={ROUTES.dashboard}
        />
      </AppShell>
    );
  }

  if (mode === "error") {
    return (
      <AppShell>
        <div className="mx-auto max-w-md">
          <ErrorState
            description={error ?? "We couldn't complete this withdrawal."}
            onAction={() => {
              setMode("form");
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
          onClick={() => (mode === "choose" ? router.back() : setMode("choose"))}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        {mode === "choose" && (
          <div className="space-y-4 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Withdraw</h2>
              <p className="text-sm text-muted-foreground">Where do you want your money?</p>
            </div>
            <div className="space-y-2.5">
              {METHODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMethod(m.id);
                      setMode("form");
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === "form" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Withdraw to {method === "bank" ? "bank" : method === "mobile" ? "mobile money" : "crypto wallet"}
              </h2>
            </div>

            {/* From currency */}
            <div className="space-y-1.5">
              <Label>From</Label>
              <div className="grid grid-cols-3 gap-2">
                {["USD", "USDT", "USDC"].map((c) => {
                  const a = assets.find((x) => x.code === c);
                  if (!a) return null;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFromCurrency(c as CurrencyCode)}
                      className={cn(
                        "rounded-lg border p-2.5 text-center transition-all",
                        fromCurrency === c
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <p className="text-sm font-medium text-foreground">{c}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(a.balance, c as CurrencyCode)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <AmountInput
                value={amount}
                onChange={setAmount}
                symbol={asset?.symbol ?? "$"}
                placeholder="0.00"
                max={asset?.balance.toFixed(2)}
                onMax={() => asset && setAmount((asset.balance - fee).toFixed(2))}
              />
              {asset && (
                <p className="text-xs text-muted-foreground">
                  Available: {formatCurrency(asset.balance, asset.code)}
                </p>
              )}
            </div>

            {/* Recipient */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="wd-name">
                  {method === "crypto" ? "Wallet label" : "Account name"}
                </Label>
                <Input
                  id="wd-name"
                  placeholder={method === "crypto" ? "My Binance wallet" : "Jane Doe"}
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="wd-detail">
                  {method === "crypto" ? "Wallet address" : method === "mobile" ? "Phone number" : "Account number"}
                </Label>
                <Input
                  id="wd-detail"
                  placeholder={method === "crypto" ? "0x..." : method === "mobile" ? "+234..." : "0123456789"}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Summary */}
            {amountNum > 0 && (
              <Card className="p-4">
                <ReviewRow label="You receive" value={`₦${receiveAmount.toLocaleString()}`} emphasize />
                <ReviewRow label="Fee" value={formatCurrency(fee, fromCurrency)} />
                <ReviewRow label="Arrival" value={method === "bank" ? "1–2 business days" : "Usually within minutes"} />
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
                setMode("review");
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {mode === "review" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Review withdrawal</h2>
              <p className="text-sm text-muted-foreground">Check the details before confirming.</p>
            </div>
            <Card className="p-4">
              <ReviewRow label="Method" value={method === "bank" ? "Bank account" : method === "mobile" ? "Mobile money" : "Crypto wallet"} />
              <ReviewRow label="Recipient" value={recipientName} />
              <ReviewRow label={method === "crypto" ? "Wallet" : "Account"} value={accountNumber} />
              <div className="my-3 border-t border-border" />
              <ReviewRow label="Amount" value={formatCurrency(amountNum, fromCurrency)} emphasize />
              <ReviewRow label="Fee" value={formatCurrency(fee, fromCurrency)} />
              <ReviewRow label="Total" value={formatCurrency(total, fromCurrency)} emphasize />
              {fromCurrency === "USD" && (
                <ReviewRow label="You receive" value={`₦${receiveAmount.toLocaleString()}`} emphasize />
              )}
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setMode("form")}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setConfirmOpen(true)}>
                Confirm withdrawal
              </Button>
            </div>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Confirm withdrawal?"
              description={`${formatCurrency(total, fromCurrency)} will be withdrawn to ${recipientName}.`}
              confirmLabel="Confirm"
              onConfirm={confirmWithdraw}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
