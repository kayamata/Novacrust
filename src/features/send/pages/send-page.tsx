"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Banknote, Wallet } from "lucide-react";
import { AppShell } from "@/shared/components/layout";
import { Button, Card, Input, Label } from "@/shared/components/ui";
import {
  AmountInput,
  AssetIcon,
  ReviewRow,
  ProcessingState,
  SuccessScreen,
  ErrorState,
  ConfirmDialog,
} from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { formatCurrency, truncateAddress, currencySymbol } from "@/utils/format";
import { hasSufficientBalance, isValidWalletAddress } from "@/utils/validate";
import { USD_RATES } from "@/shared/data";
import { cn } from "@/utils/cn";
import type { Asset, CryptoNetwork, CurrencyCode, Transaction } from "@/shared/types";

type Mode = "choose" | "crypto" | "money";
type MoneyStep = "account" | "form" | "review";
type Step = "form" | "review" | "processing" | "success" | "error";

const CRYPTO_ASSETS = ["USDT", "USDC", "BTC", "ETH"] as const;
const NETWORKS: CryptoNetwork[] = ["TRC20", "ERC20", "BEP20", "Solana"];

const FIAT_ACCOUNTS: CurrencyCode[] = ["NGN", "GBP", "USD"];

const CURRENCY_FLAGS: Partial<Record<CurrencyCode, string>> = {
  NGN: "🇳🇬",
  GBP: "🇬🇧",
  USD: "🇺🇸",
};

export function SendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { assets, sendCrypto, sendMoney, recipients } = useAppStore();

  const [mode, setMode] = React.useState<Mode>("choose");
  const [step, setStep] = React.useState<Step>("form");

  // Crypto form state — pre-select from query param if provided.
  const currencyParam = searchParams.get("currency");
  const initialAsset = currencyParam
    ? assets.find((a) => a.code === currencyParam)
    : assets.find((a) => a.code === "USDT");
  const [cryptoAsset, setCryptoAsset] = React.useState<Asset | undefined>(
    initialAsset,
  );
  const [cryptoAmount, setCryptoAmount] = React.useState("");
  const [recipientAddress, setRecipientAddress] = React.useState("");
  const [network, setNetwork] = React.useState<CryptoNetwork>("TRC20");
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  // Money form state — selected fiat account + recipient details.
  const [moneyStep, setMoneyStep] = React.useState<MoneyStep>("account");
  const [moneyAccount, setMoneyAccount] = React.useState<Asset | undefined>(
    assets.find((a) => a.code === "USD"),
  );
  const [moneyAmount, setMoneyAmount] = React.useState("");
  const [recipientName, setRecipientName] = React.useState("");
  const [bank, setBank] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [saveRecipient, setSaveRecipient] = React.useState(true);
  const [selectedRecipientId, setSelectedRecipientId] = React.useState<string>("");

  const [error, setError] = React.useState<string | null>(null);
  const [completedTx, setCompletedTx] = React.useState<Transaction | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Crypto send                                                       */
  /* ------------------------------------------------------------------ */

  function validateCrypto(): string | null {
    if (!cryptoAsset) return "Please choose an asset.";
    const amount = parseFloat(cryptoAmount);
    if (!amount || amount <= 0) return "Please enter a valid amount.";
    if (!hasSufficientBalance(amount, cryptoAsset.balance))
      return "Insufficient balance for this transaction.";
    if (!isValidWalletAddress(recipientAddress)) return "Please enter a valid wallet address.";
    return null;
  }

  async function confirmSendCrypto() {
    if (!cryptoAsset) return;
    setStep("processing");
    setError(null);
    try {
      const tx = await sendCrypto({
        assetCode: cryptoAsset.code as CurrencyCode,
        amount: parseFloat(cryptoAmount),
        recipientAddress,
        network,
      });
      setCompletedTx(tx);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Money send                                                        */
  /* ------------------------------------------------------------------ */

  const moneyAmountNum = parseFloat(moneyAmount) || 0;
  const fee = 2.5;
  const total = moneyAmountNum + fee;
  // Convert from the selected fiat account to NGN for display.
  const fromCode = moneyAccount?.code ?? "USD";
  const rate = fromCode === "NGN" ? 1 : USD_RATES.NGN / (USD_RATES[fromCode] ?? 1);
  const receiveAmount = moneyAmountNum * rate;

  function validateMoney(): string | null {
    if (!moneyAccount) return "Please choose an account.";
    if (!moneyAmountNum || moneyAmountNum <= 0) return "Please enter a valid amount.";
    if (total > moneyAccount.balance) return `Insufficient ${fromCode} balance.`;
    if (!selectedRecipientId && (!recipientName.trim() || !accountNumber.trim() || !bank.trim()))
      return "Please enter the recipient's details.";
    return null;
  }

  async function confirmSendMoney() {
    if (!moneyAccount) return;
    const recipient = selectedRecipientId
      ? recipients.find((r) => r.id === selectedRecipientId)!
      : {
          id: "tmp",
          name: recipientName.trim(),
          accountNumber: accountNumber.trim(),
          bank: bank.trim(),
          country: "Nigeria",
          countryCode: "NG",
          currency: "NGN" as CurrencyCode,
          saved: saveRecipient,
          avatarColor: "bg-teal-500",
        };

    setStep("processing");
    setError(null);
    try {
      const tx = await sendMoney({
        fromCurrency: fromCode,
        amount: moneyAmountNum,
        recipient,
      });
      setCompletedTx(tx);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  if (step === "processing") {
    return (
      <AppShell>
        <ProcessingState
          title={mode === "crypto" ? "Sending crypto…" : "Sending money…"}
          description="Please don't close this window."
        />
      </AppShell>
    );
  }

  if (step === "success" && completedTx) {
    return (
      <AppShell>
        <SuccessScreen
          title={mode === "crypto" ? "Transfer successful" : "Money sent"}
          amount={
            mode === "crypto"
              ? `${formatCurrency(completedTx.amount, completedTx.currency)} sent`
              : `${formatCurrency(completedTx.amount, completedTx.currency)} → ₦${receiveAmount.toLocaleString()}`
          }
          description={
            mode === "crypto"
              ? `${completedTx.subtitle}`
              : `To ${completedTx.counterparty?.name}. Funds typically arrive within minutes.`
          }
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
            title="Something went wrong"
            description={error ?? "We couldn't complete this transaction."}
            actionLabel="Try again"
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
        {/* Back */}
        <button
          type="button"
          onClick={() => {
            if (mode === "choose") {
              router.back();
            } else if (mode === "money" && moneyStep === "account") {
              setMode("choose");
            } else if (mode === "money" && moneyStep === "form") {
              setMoneyStep("account");
            } else if (mode === "money" && moneyStep === "review") {
              setMoneyStep("form");
              setStep("form");
            } else {
              setMode("choose");
            }
          }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        {/* Mode chooser */}
        {mode === "choose" && (
          <div className="space-y-4 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Send</h2>
              <p className="text-sm text-muted-foreground">What do you want to send?</p>
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
                  <p className="text-xs text-muted-foreground">To any wallet address</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("money");
                  setMoneyStep("account");
                }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Banknote className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Money</p>
                  <p className="text-xs text-muted-foreground">To bank or mobile money</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Crypto form */}
        {mode === "crypto" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Send crypto</h2>
              <p className="text-sm text-muted-foreground">
                Send to any wallet or exchange.
              </p>
            </div>

            {/* Asset selector */}
            <div className="space-y-1.5">
              <Label>Asset</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CRYPTO_ASSETS.map((code) => {
                  const a = assets.find((x) => x.code === code);
                  if (!a) return null;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCryptoAsset(a)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2.5 transition-all",
                        cryptoAsset?.code === code
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <AssetIcon asset={a} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground">{a.code}</p>
                        <p className="truncate text-[0.65rem] text-muted-foreground">
                          {formatCurrency(a.balance, a.code)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <AmountInput
                value={cryptoAmount}
                onChange={setCryptoAmount}
                symbol={cryptoAsset?.symbol ?? "$"}
                placeholder="0.00"
                max={cryptoAsset?.balance.toFixed(6)}
                onMax={() => cryptoAsset && setCryptoAmount(cryptoAsset.balance.toString())}
              />
              {cryptoAsset && (
                <p className="text-xs text-muted-foreground">
                  Available: {formatCurrency(cryptoAsset.balance, cryptoAsset.code)}
                </p>
              )}
            </div>

            {/* Recipient address */}
            <div className="space-y-1.5">
              <Label htmlFor="recipient-address">Recipient wallet address</Label>
              <Input
                id="recipient-address"
                placeholder="0x... or T..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>

            {/* Network */}
            <div className="space-y-1.5">
              <Label>Network</Label>
              <div className="grid grid-cols-4 gap-2">
                {NETWORKS.map((n) => (
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

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              onClick={() => {
                const err = validateCrypto();
                if (err) {
                  setError(err);
                  return;
                }
                setError(null);
                setStep("review");
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Crypto review */}
        {mode === "crypto" && step === "review" && cryptoAsset && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Review transfer</h2>
              <p className="text-sm text-muted-foreground">Check the details before confirming.</p>
            </div>
            <Card className="p-4">
              <ReviewRow label="You send" value={formatCurrency(parseFloat(cryptoAmount), cryptoAsset.code)} emphasize />
              <ReviewRow label="Network fee" value={formatCurrency(1.2, cryptoAsset.code)} />
              <ReviewRow
                label="Recipient receives"
                value={formatCurrency(parseFloat(cryptoAmount) - 1.2, cryptoAsset.code)}
                emphasize
              />
              <div className="my-3 border-t border-border" />
              <ReviewRow label="To" value={truncateAddress(recipientAddress, 6)} />
              <ReviewRow label="Network" value={network} />
              <ReviewRow label="Asset" value={cryptoAsset.code} />
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setConfirmOpen(true)}>
                Confirm transfer
              </Button>
            </div>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Confirm transfer?"
              description={`${formatCurrency(parseFloat(cryptoAmount), cryptoAsset.code)} will be sent to ${truncateAddress(recipientAddress, 6)}.`}
              confirmLabel="Confirm"
              onConfirm={confirmSendCrypto}
            />
          </div>
        )}

        {/* Money — account selection */}
        {mode === "money" && moneyStep === "account" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Send money</h2>
              <p className="text-sm text-muted-foreground">Choose an account to send from</p>
            </div>
            <div className="space-y-3">
              {FIAT_ACCOUNTS.map((code) => {
                const a = assets.find((x) => x.code === code);
                if (!a) return null;
                const flag = CURRENCY_FLAGS[code];
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setMoneyAccount(a);
                      setMoneyStep("form");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm",
                      moneyAccount?.code === code
                        ? "border-primary bg-primary/5"
                        : "border-border",
                    )}
                  >
                    {flag ? (
                      <span className="text-2xl leading-none" aria-hidden>
                        {flag}
                      </span>
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {currencySymbol(code)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{code} Account</p>
                      <p className="text-xs text-muted-foreground">{a.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(a.balance, code)}
                      </p>
                      <p className="text-xs text-muted-foreground">available</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Money form */}
        {mode === "money" && moneyStep === "form" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Send money</h2>
              <p className="text-sm text-muted-foreground">Who are you sending to?</p>
            </div>

            {/* Selected account badge */}
            {moneyAccount && (
              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 p-3">
                {CURRENCY_FLAGS[moneyAccount.code] ? (
                  <span className="text-xl leading-none" aria-hidden>
                    {CURRENCY_FLAGS[moneyAccount.code]}
                  </span>
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {currencySymbol(moneyAccount.code)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {moneyAccount.code} Account
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(moneyAccount.balance, moneyAccount.code)} available
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMoneyStep("account")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            )}

            {/* Saved recipients */}
            {recipients.filter((r) => r.accountNumber).length > 0 && (
              <div className="space-y-1.5">
                <Label>Saved recipients</Label>
                <div className="space-y-2">
                  {recipients
                    .filter((r) => r.accountNumber)
                    .map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedRecipientId(r.id);
                          setRecipientName(r.name);
                          setBank(r.bank ?? "");
                          setAccountNumber(r.accountNumber ?? "");
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all",
                          selectedRecipientId === r.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50",
                        )}
                      >
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.bank} · {r.accountNumber}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Recipient details */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="rcp-name">Account name</Label>
                <Input
                  id="rcp-name"
                  placeholder="Jane Doe"
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    setSelectedRecipientId("");
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rcp-bank">Bank</Label>
                  <Input
                    id="rcp-bank"
                    placeholder="GTBank"
                    value={bank}
                    onChange={(e) => {
                      setBank(e.target.value);
                      setSelectedRecipientId("");
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rcp-acct">Account number</Label>
                  <Input
                    id="rcp-acct"
                    placeholder="0123456789"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      setSelectedRecipientId("");
                    }}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={saveRecipient}
                  onChange={(e) => setSaveRecipient(e.target.checked)}
                  className="size-4 rounded border-border accent-primary"
                />
                Save recipient
              </label>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label>Amount ({fromCode})</Label>
              <AmountInput
                value={moneyAmount}
                onChange={setMoneyAmount}
                symbol={currencySymbol(fromCode)}
                placeholder="0.00"
                max={moneyAccount?.balance.toFixed(2)}
                onMax={() =>
                  moneyAccount && setMoneyAmount((moneyAccount.balance - fee).toFixed(2))
                }
              />
              {moneyAccount && (
                <p className="text-xs text-muted-foreground">
                  Available: {formatCurrency(moneyAccount.balance, fromCode)}
                </p>
              )}
            </div>

            {/* Summary */}
            {moneyAmountNum > 0 && (
              <Card className="p-4">
                <ReviewRow label="Recipient receives" value={`₦${receiveAmount.toLocaleString()}`} emphasize />
                <ReviewRow
                  label="Exchange rate"
                  value={`1 ${fromCode} = ₦${rate.toLocaleString()}`}
                />
                <ReviewRow label="Fee" value={formatCurrency(fee, fromCode)} />
                <ReviewRow label="Total" value={formatCurrency(total, fromCode)} emphasize />
              </Card>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              onClick={() => {
                const err = validateMoney();
                if (err) {
                  setError(err);
                  return;
                }
                setError(null);
                setMoneyStep("review");
                setStep("review");
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {/* Money review */}
        {mode === "money" && moneyStep === "review" && (
          <div className="space-y-5 nc-animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">Review transfer</h2>
              <p className="text-sm text-muted-foreground">Check the details before confirming.</p>
            </div>
            <Card className="p-4">
              <ReviewRow label="From" value={`${fromCode} Account`} />
              <ReviewRow label="Recipient" value={recipientName} />
              <ReviewRow label="Bank" value={bank} />
              <ReviewRow label="Account number" value={accountNumber} />
              <div className="my-3 border-t border-border" />
              <ReviewRow label="You send" value={formatCurrency(total, fromCode)} emphasize />
              <ReviewRow
                label="Exchange rate"
                value={`1 ${fromCode} = ₦${rate.toLocaleString()}`}
              />
              <ReviewRow label="Fee" value={formatCurrency(fee, fromCode)} />
              <ReviewRow
                label="Recipient receives"
                value={`₦${receiveAmount.toLocaleString()}`}
                emphasize
              />
            </Card>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setMoneyStep("form");
                  setStep("form");
                }}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={() => setConfirmOpen(true)}>
                Confirm
              </Button>
            </div>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Confirm transfer?"
              description={`${formatCurrency(total, fromCode)} will be sent to ${recipientName}.`}
              confirmLabel="Confirm"
              onConfirm={confirmSendMoney}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
