"use client";

import { AppShell } from "@/shared/components/layout";
import { Card, Badge } from "@/shared/components/ui";
import { CopyButton, ReviewRow } from "@/shared/components/common";
import { GLOBAL_ACCOUNTS } from "@/shared/data";
import { cn } from "@/utils/cn";

export function GlobalAccountPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Global accounts</h2>
          <p className="text-sm text-muted-foreground">
            Receive payments in your name from anywhere in the world.
          </p>
        </div>

        <div className="space-y-3">
          {GLOBAL_ACCOUNTS.map((acc) => (
            <Card key={acc.currency} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {acc.currency}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{acc.currency} account</p>
                    <p className="text-xs text-muted-foreground">{acc.note}</p>
                  </div>
                </div>
                <Badge
                  variant={acc.status === "active" ? "default" : "secondary"}
                  className={cn(
                    acc.status === "active"
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {acc.status === "active" ? "Active" : "Coming soon"}
                </Badge>
              </div>
              {acc.status === "active" && (
                <div className="mt-3 space-y-1 border-t border-border pt-3">
                  <ReviewRow label="Account name" value={acc.accountName} />
                  <ReviewRow label="Account number" value={acc.accountNumber} />
                  <ReviewRow label="Routing number" value={acc.routingNumber} />
                  <ReviewRow label="Bank" value={acc.bank} />
                  <div className="pt-2">
                    <CopyButton
                      value={`${acc.accountName}\n${acc.accountNumber}\n${acc.routingNumber}\n${acc.bank}`}
                      label="Copy details"
                      copiedLabel="Copied"
                      toastLabel="Account details copied"
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          Novacrust is a financial technology company, not a bank. Banking services are provided by
          our licensed banking partners.
        </div>
      </div>
    </AppShell>
  );
}
