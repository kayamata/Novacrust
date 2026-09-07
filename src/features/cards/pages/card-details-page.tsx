"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Snowflake,
  Eye,
  EyeOff,
  Plus,
  Lock,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/shared/components/layout";
import { Card, Button, Separator } from "@/shared/components/ui";
import {
  CardPreview,
  TransactionItem,
  EmptyState,
  SectionHeader,
  ConfirmDialog,
  PinEntry,
  ProcessingState,
} from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { formatCurrency, groupCardNumber } from "@/utils/format";

export function CardDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { cards, transactions, freezeCard, unfreezeCard } = useAppStore();

  const card = cards.find((c) => c.id === params?.id);
  const [showNumber, setShowNumber] = React.useState(false);
  const [showCvv, setShowCvv] = React.useState(false);
  const [pinOpen, setPinOpen] = React.useState(false);
  const [pinTarget, setPinTarget] = React.useState<"number" | "cvv">("number");
  const [freezeOpen, setFreezeOpen] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const cardTransactions = transactions.filter((t) => t.type === "card");

  if (!card) {
    return (
      <AppShell>
        <EmptyState
          title="Card not found"
          description="This card doesn't exist."
          action={
            <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.cards)}>
              Back to cards
            </Button>
          }
        />
      </AppShell>
    );
  }

  const frozen = card.status === "frozen";

  async function onFreeze() {
    setProcessing(true);
    try {
      if (frozen) {
        await unfreezeCard(card!.id);
        toast.success("Card unfrozen.");
      } else {
        await freezeCard(card!.id);
        toast.success("Card frozen.");
      }
    } finally {
      setProcessing(false);
    }
  }

  function requestReveal(target: "number" | "cvv") {
    setPinTarget(target);
    setPinOpen(true);
  }

  function onPinComplete() {
    setPinOpen(false);
    if (pinTarget === "number") setShowNumber(true);
    else setShowCvv(true);
    toast.success("PIN verified.");
  }

  if (processing) {
    return (
      <AppShell>
        <ProcessingState
          title={frozen ? "Unfreezing card…" : "Freezing card…"}
          description="This will only take a moment."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <button
          type="button"
          onClick={() => router.push(ROUTES.cards)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Cards
        </button>

        {/* Card preview */}
        <CardPreview card={card} />

        {/* Balance + spent */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(card.balance, card.currency)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Spent this month</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {formatCurrency(card.spentThisMonth, card.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              of {formatCurrency(card.monthlyLimit, card.currency)}
            </p>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={frozen ? "default" : "outline"}
            className="flex flex-col items-center gap-1.5 py-3"
            onClick={() => setFreezeOpen(true)}
          >
            <Snowflake className="size-5" />
            <span className="text-xs">{frozen ? "Unfreeze" : "Freeze"}</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1.5 py-3"
            onClick={() => router.push(ROUTES.deposit)}
          >
            <Plus className="size-5" />
            <span className="text-xs">Add money</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1.5 py-3"
            onClick={() => toast.info("Card details export is not available in demo mode.")}
          >
            <Download className="size-5" />
            <span className="text-xs">Export</span>
          </Button>
        </div>

        {/* Card details */}
        <Card className="p-4">
          <SectionHeader title="Card details" />
          <div className="mt-3 space-y-3">
            <DetailRow
              label="Card number"
              value={showNumber ? groupCardNumber(card.number) : card.maskedNumber}
              action={
                <button
                  type="button"
                  onClick={() => (showNumber ? setShowNumber(false) : requestReveal("number"))}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showNumber ? "Hide card number" : "Show card number"}
                >
                  {showNumber ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />
            <Separator />
            <DetailRow label="Expiry" value={card.expiry} />
            <Separator />
            <DetailRow
              label="CVV"
              value={showCvv ? card.cvv : "•••"}
              action={
                <button
                  type="button"
                  onClick={() => (showCvv ? setShowCvv(false) : requestReveal("cvv"))}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showCvv ? "Hide CVV" : "Show CVV"}
                >
                  {showCvv ? <EyeOff className="size-4" /> : <Lock className="size-4" />}
                </button>
              }
            />
            <Separator />
            <DetailRow label="Card holder" value={card.holder} />
            <Separator />
            <DetailRow label="Status" value={frozen ? "Frozen" : "Active"} />
          </div>
        </Card>

        {/* Card transactions */}
        <div className="space-y-3">
          <SectionHeader title="Card transactions" />
          <Card className="overflow-hidden">
            {cardTransactions.length === 0 ? (
              <EmptyState title="No card transactions yet" description="Card payments will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {cardTransactions.map((tx) => (
                  <li key={tx.id}>
                    <TransactionItem
                      transaction={tx}
                      onClick={() => router.push(ROUTES.transactionDetails(tx.id))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* PIN confirmation for sensitive reveals */}
      <ConfirmDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        title="Enter your PIN"
        description="Enter your 4-digit PIN to reveal card details."
        confirmLabel="Verify"
        cancelLabel="Cancel"
        onConfirm={() => {
          /* handled by PinEntry onComplete */
        }}
      >
        <div className="py-4">
          <PinEntry length={4} onComplete={onPinComplete} />
        </div>
      </ConfirmDialog>

      {/* Freeze confirmation */}
      <ConfirmDialog
        open={freezeOpen}
        onOpenChange={setFreezeOpen}
        title={frozen ? "Unfreeze this card?" : "Freeze this card?"}
        description={
          frozen
            ? "You'll be able to make new purchases again."
            : "You won't be able to make new purchases until you unfreeze it."
        }
        confirmLabel={frozen ? "Unfreeze card" : "Freeze card"}
        destructive={!frozen}
        onConfirm={onFreeze}
      />
    </AppShell>
  );
}

function DetailRow({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium text-foreground">{value}</span>
        {action}
      </div>
    </div>
  );
}
