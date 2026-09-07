"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { Sidebar } from "@/shared/components/layout/sidebar";
import { MobileNav } from "@/shared/components/layout/mobile-nav";
import { Header } from "@/shared/components/layout/header";
import { Logo } from "@/shared/components/layout/logo";
import { DemoBadge } from "@/shared/components/layout/demo-badge";
import { ThemeToggle } from "@/shared/components/layout/theme-toggle";
import { Button, Skeleton } from "@/shared/components/ui";

/**
 * Derive a page title from the current pathname.
 */
function deriveTitle(pathname: string): string {
  if (pathname === ROUTES.dashboard) return "Dashboard";
  if (pathname.startsWith(ROUTES.wallet)) return "Wallet";
  if (pathname.startsWith(ROUTES.send)) return "Send";
  if (pathname.startsWith(ROUTES.receive)) return "Receive";
  if (pathname.startsWith(ROUTES.deposit)) return "Add money";
  if (pathname.startsWith(ROUTES.withdraw)) return "Withdraw";
  if (pathname.startsWith(ROUTES.exchange)) return "Exchange";
  if (pathname.startsWith(ROUTES.cards)) return "Cards";
  if (pathname.startsWith(ROUTES.transactions)) return "Transactions";
  if (pathname.startsWith(ROUTES.globalAccount)) return "Global Account";
  if (pathname.startsWith(ROUTES.giftCards)) return "Gift Cards";
  if (pathname.startsWith(ROUTES.settings)) return "Settings";
  if (pathname.startsWith(ROUTES.support)) return "Support";
  return "Novacrust";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, hydrated } = useAuth();

  // Wait for auth hydration before deciding to redirect.
  React.useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(ROUTES.signin);
    }
  }, [hydrated, isAuthenticated, router]);

  // Loading state while auth hydrates.
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  // If not authenticated, render a minimal shell (redirect is in flight).
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Logo size="lg" />
        <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
        <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.signin)}>
          Go to sign in
        </Button>
      </div>
    );
  }

  const title = deriveTitle(pathname);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title={title} />
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 lg:px-8 lg:pb-12">
          <div key={pathname} className="nc-animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

/**
 * Auth-only shell — for sign in / sign up / forgot password pages.
 * Renders the children centered with the brand logo, no app chrome.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex items-center justify-between px-6 py-5">
        <Logo />
        <div className="flex items-center gap-3">
          <DemoBadge />
          <ThemeToggle />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md nc-animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
