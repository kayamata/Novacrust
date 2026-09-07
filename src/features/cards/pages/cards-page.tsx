"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Snowflake, CreditCard } from "lucide-react";
import { AppShell } from "@/shared/components/layout";
import { Card, Button } from "@/shared/components/ui";
import { CardPreview } from "@/shared/components/common";
import { EmptyState } from "@/shared/components/common";
import { useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { formatCurrency } from "@/utils/format";

export function CardsPage() {
  const router = useRouter();
  const { cards } = useAppStore();

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">Your cards</h2>
            <p className="text-sm text-muted-foreground">Manage your virtual cards.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.deposit)}>
            <Plus className="size-4" />
            Add money
          </Button>
        </div>

        {cards.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No cards yet"
            description="Get a virtual card to spend globally from your Novacrust balance."
            action={
              <Button size="sm" onClick={() => router.push(ROUTES.settings)}>
                Get a card
              </Button>
            }
          />
        ) : (
          <div className="space-y-4 nc-animate-stagger">
            {cards.map((card) => (
              <div key={card.id} className="space-y-3">
                <CardPreview card={card} />
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(card.balance, card.currency)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.cardDetails(card.id))}>
                        <Eye className="size-4" />
                        View details
                      </Button>
                      <Button
                        variant={card.status === "frozen" ? "default" : "outline"}
                        size="sm"
                        onClick={() => router.push(ROUTES.cardDetails(card.id))}
                      >
                        <Snowflake className="size-4" />
                        {card.status === "frozen" ? "Unfreeze" : "Freeze"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
