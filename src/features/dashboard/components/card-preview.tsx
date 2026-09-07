"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { CardPreview } from "@/shared/components/common";
import { Button } from "@/shared/components/ui";
import { formatCurrency } from "@/utils/format";
import { ROUTES } from "@/utils/constants";
import type { VirtualCard } from "@/shared/types";

/**
 * Dashboard card widget — preview + available balance + view button.
 * Dashboard-specific composition around the shared CardPreview.
 */
export function DashboardCardWidget({ card }: { card: VirtualCard }) {
  return (
    <div className="space-y-3">
      <CardPreview card={card} compact />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Available</p>
          <p className="text-lg font-semibold text-foreground">
            {formatCurrency(card.balance, card.currency)}
          </p>
        </div>
        <Link href={ROUTES.cardDetails(card.id)}>
          <Button variant="outline" size="sm">
            <Eye className="size-4" />
            View card
          </Button>
        </Link>
      </div>
    </div>
  );
}
