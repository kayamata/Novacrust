"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Wallet, Banknote } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/shared/components/layout";
import { Card, Button, Label } from "@/shared/components/ui";
import {
  AmountInput,
  AssetIcon,
  CopyButton,
  ProcessingState,
  SuccessScreen,
  ReviewRow,
  ConfirmDialog,
} from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { MOCK_BANK_ACCOUNT } from "@/shared/data";
import { generateWalletAddress, formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Asset, CryptoNetwork, CurrencyCode, Transaction } from "@/shared/types";

type Mode = "choose" | "crypto" | "bank";
type Step = "address" | "confirm" | "processing" | "success";

const CRYPTO_ASSETS = ["USDT", "USDC", "BTC", "ETH", "SOL"] as const;
const NETWORKS_BY_ASSET: Record<string, CryptoNetwork[]> = {
  USDT: ["TRC20", "ERC20", "BEP20"],
  USDC: ["ERC20", "Solana", "BEP20"],
  BTC: ["Bitcoin"],
  ETH: ["Ethereum"],
  SOL: ["Solana"],
};

export function DepositPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { assets, depositCrypto } = useAppStore();

  const [mode, setMode] = React.useState<Mode>("choose");
  const [step, setStep] = React.useState<Step>("address");

  // Pre-select from query param if provided.
  const currencyParam = searchParams.get("currency");
  const initialAsset = currencyParam
    ? assets.find((a) => a.code === currencyParam)
    : assets.find((a) => a.code === "USDT");
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | undefined>(
    initialAsset,
  );
  const [network, setNetwork] = React.useState<CryptoNetwork>("TRC20");
  const [address] = React.useState(() => generateWalletAddress("Ethereum"));
  const [amount, setAmount] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [completedTx, setCompletedTx] = React.useState<Transaction | null>(null);

  async function confirmDeposit() {
    if (!selectedAsset) return;
    setStep("processing");
    try {
      const tx = await depositCrypto({
        assetCode: selectedAsset.code as CurrencyCode,
        amount: parseFloat(amount),
        network,
      });
      setCompletedTx(tx);
      setStep("success");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setStep("address");
    }
  }

  if (step === "processing") {
    return (
      <AppShell>
        <ProcessingState title="Confirming deposit…" description="This usually takes a few seconds." />
      </AppShell>
    );
  }

  if (step === "success" && completedTx) {
    return (
      <AppShell>
        <SuccessScreen
          title="Deposit successful"
          amount={formatCurrency(completedTx.amount, completedTx.currency)}
          description={`${completedTx.subtitle}. Your balance has been updated.`}
          primaryActionLabel="View transaction"
          primaryActionHref={ROUTES.transactionDetails(completedTx.id)}
          secondaryActionLabel="Done"
          secondaryActionHref={ROUTES.dashboard}
        />
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
              <h2 className="text-xl font-bold tracking-tight text-foreground">Add money</h2>
              <p className="text-sm text-muted-foreground">How would you like to add money?</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("crypto")}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Crypto</p>
                  <p className="text-xs text-muted-foreground">From any wallet or exchange</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode("bank")}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Banknote className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Bank transfer</p>
                  <p className="text-xs text-muted-foreground">ACH or wire to your account</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Crypto deposit */}
        {mode === "crypto" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Deposit crypto</h2>
              <p className="text-sm text-muted-foreground">Receive crypto into your Novacrust wallet.</p>
            </div>

            {/* Asset selector */}
            <div className="space-y-1.5">
              <Label>Select asset</Label>
              <div className="grid grid-cols-5 gap-2">
                {CRYPTO_ASSETS.map((code) => {
                  const a = assets.find((x) => x.code === code);
                  if (!a) return null;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setSelectedAsset(a);
                        setNetwork(NETWORKS_BY_ASSET[code][0]);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-all",
                        selectedAsset?.code === code
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <AssetIcon asset={a} size="sm" />
                      <span className="text-[0.65rem] font-medium">{a.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Network */}
            <div className="space-y-1.5">
              <Label>Select network</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {(NETWORKS_BY_ASSET[selectedAsset?.code ?? "USDT"] ?? []).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNetwork(n)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                      network === n
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            <Card className="p-5">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-40 items-center justify-center rounded-xl border-2 border-border bg-white">
                  <div className="grid grid-cols-8 gap-0.5">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn("size-3", (i * 7 + 3) % 3 === 0 ? "bg-black" : "bg-white")}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full">
                  <p className="text-xs text-muted-foreground">
                    Your {selectedAsset?.code} deposit address
                  </p>
                  <p className="mt-1 break-all rounded-lg bg-muted px-3 py-2 font-mono text-sm text-foreground">
                    {address}
                  </p>
                </div>
                <CopyButton
                  value={address}
                  label="Copy address"
                  copiedLabel="Address copied"
                  toastLabel="Address copied"
                  className="w-full justify-center"
                />
              </div>
            </Card>

            {/* Simulate deposit (demo control) */}
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Demo: simulate an incoming deposit
              </p>
              <div className="mt-3 space-y-3">
                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  symbol={selectedAsset?.symbol ?? "$"}
                  placeholder="0.00"
                />
                <Button
                  className="w-full"
                  disabled={!amount || parseFloat(amount) <= 0}
                  onClick={() => setConfirmOpen(true)}
                >
                  Simulate deposit
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-xs text-muted-foreground">
              Send only {selectedAsset?.code} via the {network} network. Sending other assets may
              result in permanent loss.
            </div>

            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Confirm deposit?"
              description={`${formatCurrency(parseFloat(amount || "0"), selectedAsset?.code ?? "USD")} ${selectedAsset?.code} via ${network}.`}
              confirmLabel="Confirm"
              onConfirm={confirmDeposit}
            />
          </div>
        )}

        {/* Bank deposit */}
        {mode === "bank" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Bank transfer</h2>
              <p className="text-sm text-muted-foreground">Send money to your Novacrust account.</p>
            </div>
            <Card className="p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                USD Account
              </p>
              <div className="mt-3 space-y-1">
                <ReviewRow label="Account name" value={MOCK_BANK_ACCOUNT.accountName} />
                <ReviewRow label="Account number" value={MOCK_BANK_ACCOUNT.accountNumber} />
                <ReviewRow label="Routing number" value={MOCK_BANK_ACCOUNT.routingNumber} />
                <ReviewRow label="Bank" value={MOCK_BANK_ACCOUNT.bank} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <CopyButton
                  value={MOCK_BANK_ACCOUNT.accountNumber}
                  label="Copy account number"
                  copiedLabel="Copied"
                  toastLabel="Account number copied"
                />
                <CopyButton
                  value={`${MOCK_BANK_ACCOUNT.accountName} ${MOCK_BANK_ACCOUNT.accountNumber} ${MOCK_BANK_ACCOUNT.routingNumber} ${MOCK_BANK_ACCOUNT.bank}`}
                  label="Copy details"
                  copiedLabel="Copied"
                  toastLabel="Account details copied"
                />
              </div>
            </Card>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              Transfers typically arrive within 1–2 business days. There are no fees for receiving
              ACH or wire transfers.
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
