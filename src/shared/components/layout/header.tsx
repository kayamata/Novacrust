"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Bell, HelpCircle, LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/shared/components/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import { ROUTES } from "@/utils/constants";
import { useAuth, useAppStore } from "@/providers";
import { getInitials } from "@/utils/format";
import { NotificationsDrawer } from "@/shared/components/layout/notifications-drawer";
import { GlobalSearch } from "@/shared/components/layout/global-search";
import { ThemeToggle } from "@/shared/components/layout/theme-toggle";

export function Header({ title }: { title: string }) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { unreadNotificationCount } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Guest";
  const initials = user ? getInitials(fullName) : "?";

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md lg:px-8">
        <h1 className="text-base font-semibold tracking-tight text-foreground lg:text-lg">
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Search — desktop inline, mobile button */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex w-56 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted lg:w-64"
            >
              <Search className="size-4" />
              <span>Search…</span>
              <kbd className="ml-auto rounded border border-border bg-background px-1.5 text-[0.65rem] font-medium text-muted-foreground">
                /
              </kbd>
            </button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={() => setNotifOpen(true)}
            className="relative"
          >
            <Bell className="size-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2 rounded-full bg-primary">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              </span>
            )}
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Help"
            onClick={() => router.push(ROUTES.support)}
            className="hidden sm:flex"
          >
            <HelpCircle className="size-5" />
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-muted"
                  aria-label="Open profile menu"
                />
              }
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{fullName}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user?.email ?? "guest@novacrust.com"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(ROUTES.settings)}>
                  <User className="size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(ROUTES.settings)}>
                  <SettingsIcon className="size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(ROUTES.support)}>
                  <HelpCircle className="size-4" />
                  Help & support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    signOut();
                    router.push(ROUTES.signin);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationsDrawer open={notifOpen} onOpenChange={setNotifOpen} />
    </>
  );
}
