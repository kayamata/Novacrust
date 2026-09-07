"use client";

import * as React from "react";
import { ArrowLeft, Wallet, Banknote, Globe } from "lucide-react";
import { AppShell } from "@/shared/components/layout";
import { Card, Label } from "@/shared/components/ui";
import { CopyButton, AssetIcon, ReviewRow } from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { MOCK_BANK_ACCOUNT, GLOBAL_ACCOUNTS } from "@/shared/data";
import { generateWalletAddress } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { Asset, CryptoNetwork } from "@/shared/types";

type Mode = "choose" | "crypto" | "bank" | "global";

const CRYPTO_ASSETS = ["USDT", "USDC", "BTC", "ETH"] as const;
const NETWORKS_BY_ASSET: Record<string, CryptoNetwork[]> = {
  USDT: ["TRC20", "ERC20", "BEP20"],
  USDC: ["ERC20", "Solana", "BEP20"],
  BTC: ["Bitcoin"],
  ETH: ["Ethereum"],
};

export function ReceivePage() {
  const { assets } = useAppStore();
  const [mode, setMode] = React.useState<Mode>("choose");
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | undefined>(
    assets.find((a) => a.code === "USDT"),
  );
  const [network, setNetwork] = React.useState<CryptoNetwork>("TRC20");
  const [address] = React.useState(() => generateWalletAddress("Ethereum"));

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <button
          type="button"
          onClick={() => (mode === "choose" ? history.back() : setMode("choose"))}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        {mode === "choose" && (
          <div className="space-y-4 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Receive</h2>
              <p className="text-sm text-muted-foreground">How would you like to receive money?</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "crypto", icon: Wallet, label: "Crypto", desc: "To your wallet" },
                { id: "bank", icon: Banknote, label: "Bank transfer", desc: "To your account" },
                { id: "global", icon: Globe, label: "Global account", desc: "USD / EUR / GBP" },
              ].map((o) => {
                const Icon = o.icon;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setMode(o.id as Mode)}
                    className="flex flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground">{o.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Crypto receive */}
        {mode === "crypto" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Receive crypto</h2>
              <p className="text-sm text-muted-foreground">Share your address to receive funds.</p>
            </div>

            {/* Asset selector */}
            <div className="space-y-1.5">
              <Label>Asset</Label>
              <div className="grid grid-cols-4 gap-2">
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
                        "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all",
                        selectedAsset?.code === code
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <AssetIcon asset={a} size="sm" />
                      <span className="text-xs font-medium">{a.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Network */}
            <div className="space-y-1.5">
              <Label>Network</Label>
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

            {/* Address + QR */}
            <Card className="p-5">
              <div className="flex flex-col items-center gap-4 text-center">
                {/* QR placeholder */}
                <div className="flex size-44 items-center justify-center rounded-xl border-2 border-border bg-white">
                  <div className="grid grid-cols-8 gap-0.5">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "size-3",
                          (i * 7 + 3) % 3 === 0 ? "bg-black" : "bg-white",
                        )}
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

            <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-xs text-muted-foreground">
              Send only {selectedAsset?.code} via the {network} network. Sending other assets may
              result in permanent loss.
            </div>
          </div>
        )}

        {/* Bank receive */}
        {mode === "bank" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Bank transfer</h2>
              <p className="text-sm text-muted-foreground">Receive money to your Novacrust account.</p>
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
          </div>
        )}

        {/* Global account receive */}
        {mode === "global" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Global accounts</h2>
              <p className="text-sm text-muted-foreground">Receive payments in your name.</p>
            </div>
            <div className="space-y-3">
              {GLOBAL_ACCOUNTS.map((acc) => (
                <Card key={acc.currency} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {acc.currency}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{acc.currency} account</p>
                        <p className="text-xs text-muted-foreground">{acc.note}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        acc.status === "active"
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {acc.status === "active" ? "Active" : "Coming soon"}
                    </span>
                  </div>
                  {acc.status === "active" && (
                    <div className="mt-3 space-y-1 border-t border-border pt-3">
                      <ReviewRow label="Account name" value={acc.accountName} />
                      <ReviewRow label="Account number" value={acc.accountNumber} />
                      <ReviewRow label="Routing number" value={acc.routingNumber} />
                      <ReviewRow label="Bank" value={acc.bank} />
                      <div className="pt-2">
                        <CopyButton
                          value={`${acc.accountName} ${acc.accountNumber} ${acc.routingNumber} ${acc.bank}`}
                          label="Copy details"
                          copiedLabel="Copied"
                          toastLabel="Account details copied"
                        />
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
