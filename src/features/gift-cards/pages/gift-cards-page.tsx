"use client";

import * as React from "react";
import { ArrowLeft, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/shared/components/layout";
import { Card, Button, Tabs, TabsList, TabsTrigger, TabsContent, Label } from "@/shared/components/ui";
import { AmountInput, ReviewRow, SuccessScreen, ProcessingState } from "@/shared/components/common";
import { GIFT_CARDS } from "@/shared/data";
import { formatCurrency } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { GiftCard } from "@/shared/types";

type Step = "browse" | "buy" | "processing" | "success" | "sell" | "sellForm" | "sellSuccess";

export function GiftCardsPage() {
  const [tab, setTab] = React.useState<"buy" | "sell">("buy");
  const [step, setStep] = React.useState<Step>("browse");
  const [selected, setSelected] = React.useState<GiftCard | null>(null);
  const [denomination, setDenomination] = React.useState<number>(0);
  const [sellCard, setSellCard] = React.useState<GiftCard | null>(null);
  const [sellAmount, setSellAmount] = React.useState("");
  const [cardUploaded, setCardUploaded] = React.useState(false);

  const sellAmountNum = parseFloat(sellAmount) || 0;
  const sellPayout = sellCard ? sellAmountNum * (sellCard.sellPayout / 100) : 0;

  function buy() {
    if (!selected || !denomination) return;
    setStep("processing");
    setTimeout(() => {
      toast.success(`${selected.brand} $${denomination} gift card purchased.`);
      setStep("success");
    }, 1200);
  }

  function sell() {
    if (!sellCard || !sellAmountNum) return;
    setStep("processing");
    setTimeout(() => {
      toast.success(`${sellCard.brand} gift card submitted for review.`);
      setStep("sellSuccess");
    }, 1200);
  }

  if (step === "processing") {
    return (
      <AppShell>
        <ProcessingState title={tab === "buy" ? "Processing purchase…" : "Submitting gift card…"} />
      </AppShell>
    );
  }

  if (step === "success" && selected) {
    return (
      <AppShell>
        <SuccessScreen
          title="Purchase successful"
          amount={`${formatCurrency(denomination, "USD")} ${selected.brand} gift card`}
          description="Your gift card code has been sent to your email."
          primaryActionLabel="Buy another"
          primaryActionHref="/gift-cards"
          secondaryActionLabel="Done"
          secondaryActionHref="/dashboard"
        />
      </AppShell>
    );
  }

  if (step === "sellSuccess" && sellCard) {
    return (
      <AppShell>
        <SuccessScreen
          title="Gift card submitted"
          amount={`${formatCurrency(sellPayout, "USD")} estimated payout`}
          description={`Your ${sellCard.brand} gift card is under review. Payout typically arrives within 30 minutes.`}
          primaryActionLabel="Sell another"
          primaryActionHref="/gift-cards"
          secondaryActionLabel="Done"
          secondaryActionHref="/dashboard"
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Gift cards</h2>
          <p className="text-sm text-muted-foreground">Buy or sell gift cards instantly.</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as "buy" | "sell"); setStep("browse"); }}>
          <TabsList className="w-full">
            <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
          </TabsList>

          {/* Buy tab */}
          <TabsContent value="buy" className="mt-4 space-y-4">
            {step === "browse" && (
              <div className="grid grid-cols-2 gap-3">
                {GIFT_CARDS.map((gc) => (
                  <button
                    key={gc.id}
                    type="button"
                    onClick={() => {
                      setSelected(gc);
                      setDenomination(gc.denominations[0]);
                      setStep("buy");
                    }}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className={cn("flex size-12 items-center justify-center rounded-lg text-lg font-bold text-white", gc.color)}>
                      {gc.glyph ?? gc.brand[0]}
                    </div>
                    <p className="text-sm font-medium text-foreground">{gc.brand}</p>
                    <p className="text-xs text-muted-foreground">
                      Save {gc.buyDiscount}% off
                    </p>
                  </button>
                ))}
              </div>
            )}

            {step === "buy" && selected && (
              <div className="space-y-5 nc-animate-fade-in">
                <button
                  type="button"
                  onClick={() => setStep("browse")}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  All cards
                </button>
                <div className="flex items-center gap-3">
                  <div className={cn("flex size-14 items-center justify-center rounded-xl text-xl font-bold text-white", selected.color)}>
                    {selected.glyph ?? selected.brand[0]}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{selected.brand}</p>
                    <p className="text-sm text-muted-foreground">Save {selected.buyDiscount}% off face value</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Choose amount</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.denominations.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDenomination(d)}
                        className={cn(
                          "rounded-lg border py-2.5 text-sm font-medium transition-all",
                          denomination === d
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-foreground hover:bg-muted/50",
                        )}
                      >
                        ${d}
                      </button>
                    ))}
                  </div>
                </div>
                <Card className="p-4">
                  <ReviewRow label="Face value" value={formatCurrency(denomination, "USD")} />
                  <ReviewRow label="Discount" value={`-${formatCurrency(denomination * (selected.buyDiscount / 100), "USD")}`} />
                  <ReviewRow label="You pay" value={formatCurrency(denomination * (1 - selected.buyDiscount / 100), "USD")} emphasize />
                </Card>
                <Button className="w-full" onClick={buy}>
                  Buy for {formatCurrency(denomination * (1 - selected.buyDiscount / 100), "USD")}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Sell tab */}
          <TabsContent value="sell" className="mt-4 space-y-4">
            {(step === "browse" || step === "sell") && (
              <>
                {step === "sell" && sellCard && (
                  <button
                    type="button"
                    onClick={() => setStep("browse")}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" />
                    All cards
                  </button>
                )}
                {step === "browse" && (
                  <div className="grid grid-cols-2 gap-3">
                    {GIFT_CARDS.map((gc) => (
                      <button
                        key={gc.id}
                        type="button"
                        onClick={() => {
                          setSellCard(gc);
                          setStep("sell");
                        }}
                        className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
                      >
                        <div className={cn("flex size-12 items-center justify-center rounded-lg text-lg font-bold text-white", gc.color)}>
                          {gc.glyph ?? gc.brand[0]}
                        </div>
                        <p className="text-sm font-medium text-foreground">{gc.brand}</p>
                        <p className="text-xs text-muted-foreground">Up to {gc.sellPayout}% payout</p>
                      </button>
                    ))}
                  </div>
                )}

                {step === "sell" && sellCard && (
                  <div className="space-y-5 nc-animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex size-12 items-center justify-center rounded-xl text-lg font-bold text-white", sellCard.color)}>
                        {sellCard.glyph ?? sellCard.brand[0]}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-foreground">{sellCard.brand}</p>
                        <p className="text-sm text-muted-foreground">{sellCard.sellPayout}% payout</p>
                      </div>
                    </div>

                    {/* Upload */}
                    <div className="space-y-1.5">
                      <Label>Upload gift card</Label>
                      <button
                        type="button"
                        onClick={() => {
                          setCardUploaded(true);
                          toast.success("Gift card uploaded.");
                        }}
                        className={cn(
                          "flex w-full flex-col items-center gap-2 rounded-xl border border-dashed p-6 transition-colors",
                          cardUploaded ? "border-success/40 bg-success/5" : "border-border hover:bg-muted/50",
                        )}
                      >
                        {cardUploaded ? (
                          <>
                            <div className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
                              <Check className="size-5" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Card uploaded</p>
                          </>
                        ) : (
                          <>
                            <Upload className="size-6 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload</p>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5">
                      <Label>Card value</Label>
                      <AmountInput value={sellAmount} onChange={setSellAmount} symbol="$" placeholder="0.00" />
                    </div>

                    {sellAmountNum > 0 && (
                      <Card className="p-4">
                        <ReviewRow label="Card value" value={formatCurrency(sellAmountNum, "USD")} />
                        <ReviewRow label="Payout rate" value={`${sellCard.sellPayout}%`} />
                        <ReviewRow label="Estimated payout" value={formatCurrency(sellPayout, "USD")} emphasize />
                      </Card>
                    )}

                    <Button
                      className="w-full"
                      disabled={!cardUploaded || !sellAmountNum}
                      onClick={sell}
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
