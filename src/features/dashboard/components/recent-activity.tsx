"use client";

import Link from "next/link";
import { Card } from "@/shared/components/ui";
import { TransactionItem } from "@/shared/components/common";
import { ROUTES } from "@/utils/constants";
import type { Transaction } from "@/shared/types";

export function RecentActivity({
  transactions,
  onSelect,
}: {
  transactions: Transaction[];
  onSelect?: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <ul className="divide-y divide-border">
        {transactions.slice(0, 6).map((tx) => (
          <li key={tx.id}>
            <TransactionItem
              transaction={tx}
              onClick={() => (onSelect ? onSelect(tx.id) : undefined)}
            />
          </li>
        ))}
      </ul>
      {transactions.length > 6 && (
        <div className="border-t border-border p-2">
          <Link
            href={ROUTES.transactions}
            className="block rounded-lg py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            View all
          </Link>
        </div>
      )}
    </Card>
  );
}
