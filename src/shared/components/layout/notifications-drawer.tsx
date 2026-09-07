"use client";

import { Bell, CheckCheck, ArrowDownLeft, CreditCard, ShieldCheck, Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui";
import { Button } from "@/shared/components/ui";
import { useAppStore } from "@/providers";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import type { AppNotification } from "@/shared/types";

const ICON_FOR: Record<AppNotification["type"], React.ComponentType<{ className?: string }>> = {
  transaction: ArrowDownLeft,
  card: CreditCard,
  security: ShieldCheck,
  verification: CheckCheck,
  system: Info,
};

const COLOR_FOR: Record<AppNotification["type"], string> = {
  transaction: "bg-success/10 text-success",
  card: "bg-primary/10 text-primary",
  security: "bg-warning/10 text-warning-foreground",
  verification: "bg-success/10 text-success",
  system: "bg-muted text-muted-foreground",
};

export function NotificationsDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationCount } =
    useAppStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Bell className="size-4" />
                Notifications
              </SheetTitle>
              <SheetDescription>
                {unreadNotificationCount > 0
                  ? `${unreadNotificationCount} unread`
                  : "You're all caught up"}
              </SheetDescription>
            </div>
            {unreadNotificationCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsRead}
                className="text-primary"
              >
                <CheckCheck className="size-4" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Bell className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No notifications</p>
                <p className="text-xs text-muted-foreground">
                  You&apos;ll see updates about your money here.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = ICON_FOR[n.type];
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/50",
                        !n.read && "bg-primary/[0.03]",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full",
                          COLOR_FOR[n.type],
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="size-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(n.date, "datetime")}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
