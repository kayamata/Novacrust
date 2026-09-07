"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CreditCard,
  Receipt,
  Globe,
  Gift,
  LifeBuoy,
  Settings,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { ROUTES } from "@/utils/constants";
import { Logo } from "@/shared/components/layout/logo";
import { DemoBadge } from "@/shared/components/layout/demo-badge";
import { useAuth } from "@/providers";
import { getInitials } from "@/utils/format";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MAIN_NAV: NavItem[] = [
  { label: "Overview", href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: "Wallet", href: ROUTES.wallet, icon: Wallet },
  { label: "Send", href: ROUTES.send, icon: ArrowUpRight },
  { label: "Receive", href: ROUTES.receive, icon: ArrowDownLeft },
  { label: "Exchange", href: ROUTES.exchange, icon: RefreshCw },
  { label: "Cards", href: ROUTES.cards, icon: CreditCard },
];

const MORE_NAV: NavItem[] = [
  { label: "Transactions", href: ROUTES.transactions, icon: Receipt },
  { label: "Global Account", href: ROUTES.globalAccount, icon: Globe },
  { label: "Gift Cards", href: ROUTES.giftCards, icon: Gift },
];

const BOTTOM_NAV: NavItem[] = [
  { label: "Support", href: ROUTES.support, icon: LifeBuoy },
  { label: "Settings", href: ROUTES.settings, icon: Settings },
];

function NavSection({ title }: { title: string }) {
  return (
    <div className="px-3 pt-5 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {title}
    </div>
  );
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== ROUTES.dashboard && pathname.startsWith(item.href));

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const initials = user ? getInitials(fullName) : "?";

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-sidebar-border">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-2">
        <NavSection title="Main" />
        <div className="space-y-0.5 px-3">
          {MAIN_NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        <NavSection title="More" />
        <div className="space-y-0.5 px-3">
          {MORE_NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        <NavSection title="Bottom" />
        <div className="space-y-0.5 px-3">
          {BOTTOM_NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </nav>

      {/* Demo badge */}
      <div className="px-5 pb-2">
        <DemoBadge />
      </div>

      {/* User profile */}
      <div className="border-t border-sidebar-border p-3">
        <Link
          href={ROUTES.settings}
          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-foreground">
              {fullName}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {user?.email ?? "guest@novacrust.com"}
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
