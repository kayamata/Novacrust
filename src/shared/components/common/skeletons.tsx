import { Skeleton } from "@/shared/components/ui";
import { cn } from "@/utils/cn";

/**
 * Skeleton for a list of transaction rows — used while data hydrates.
 */
export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="shrink-0 space-y-1.5 text-right">
            <Skeleton className="ml-auto h-3.5 w-16" />
            <Skeleton className="ml-auto h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for the balance card — matches the BalanceCard layout.
 */
export function BalanceCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 sm:p-6", className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-10 w-48" />
      <Skeleton className="mt-2 h-4 w-32" />
      <div className="mt-5 flex gap-1">
        <Skeleton className="h-6 w-10 rounded-md" />
        <Skeleton className="h-6 w-10 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-12 w-full" />
    </div>
  );
}

/**
 * Skeleton for a card preview widget.
 */
export function CardPreviewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="aspect-[1.6/1] w-full rounded-2xl" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton for a list of asset/balance rows.
 */
export function BalanceListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="shrink-0 space-y-1.5 text-right">
            <Skeleton className="ml-auto h-3.5 w-20" />
            <Skeleton className="ml-auto h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for quick action tiles.
 */
export function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-row lg:gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5"
        >
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
