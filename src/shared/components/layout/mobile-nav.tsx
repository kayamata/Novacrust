"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  CreditCard,
  MoreHorizontal,
  ArrowDownLeft,
  RefreshCw,
  Receipt,
  Globe,
  Gift,
  LifeBuoy,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/utils/constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui";

const PRIMARY_NAV = [
  { label: "Home", href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: "Wallet", href: ROUTES.wallet, icon: Wallet },
  { label: "Send", href: ROUTES.send, icon: ArrowUpRight },
  { label: "Cards", href: ROUTES.cards, icon: CreditCard },
];

const MORE_NAV = [
  { label: "Receive", href: ROUTES.receive, icon: ArrowDownLeft },
  { label: "Exchange", href: ROUTES.exchange, icon: RefreshCw },
  { label: "Transactions", href: ROUTES.transactions, icon: Receipt },
  { label: "Global Account", href: ROUTES.globalAccount, icon: Globe },
  { label: "Gift Cards", href: ROUTES.giftCards, icon: Gift },
  { label: "Settings", href: ROUTES.settings, icon: Settings },
  { label: "Support", href: ROUTES.support, icon: LifeBuoy },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== ROUTES.dashboard && pathname.startsWith(href));

  return (
    <>
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md safe-area-inset-bottom">
        <div className="grid grid-cols-5">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[0.65rem] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[0.65rem] font-medium transition-colors",
              MORE_NAV.some((n) => isActive(n.href))
                ? "text-primary"
                : "text-muted-foreground",
            )}
            aria-label="More navigation"
          >
            <MoreHorizontal className="size-5" />
            <span>More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-6" showCloseButton={false}>
          <SheetHeader className="pb-2">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" />
            <SheetTitle>More</SheetTitle>
            <SheetDescription>Quick access to the rest of Novacrust.</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2 p-4">
            {MORE_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors",
                    active
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <div className="px-4 pt-2">
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
              Close
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
