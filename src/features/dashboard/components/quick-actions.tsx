"use client";

import { Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, Banknote } from "lucide-react";
import { QuickAction } from "@/shared/components/common";
import { ROUTES } from "@/utils/constants";

/**
 * Quick actions row — "What would you like to do?"
 * Desktop: horizontal. Mobile: 2-column grid.
 */
export function QuickActions() {
  const actions = [
    { icon: Plus, label: "Add money", description: "Deposit crypto or cash", href: ROUTES.deposit },
    { icon: ArrowUpRight, label: "Send", description: "Move money to someone", href: ROUTES.send },
    { icon: ArrowDownLeft, label: "Receive", description: "Get paid", href: ROUTES.receive },
    { icon: RefreshCw, label: "Exchange", description: "Swap currencies", href: ROUTES.exchange },
    { icon: Banknote, label: "Withdraw", description: "Cash out to bank", href: ROUTES.withdraw },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-row lg:gap-3">
      {actions.map((a, i) => (
        <QuickAction
          key={a.label}
          icon={a.icon}
          label={a.label}
          description={a.description}
          href={a.href}
          className={i >= 3 ? "lg:flex-1" : "lg:flex-1"}
        />
      ))}
    </div>
  );
}
