"use client";

import * as React from "react";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatCurrency, formatPercent } from "@/utils/format";
import { Skeleton } from "@/shared/components/ui";

/**
 * Animated number that smoothly transitions between values.
 */
function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  const rafRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const duration = 500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <span className={className}>{format(display)}</span>;
}

export function BalanceCard({
  totalUsd,
  ngnEquivalent,
  monthlyChange,
  loading,
  className,
}: {
  totalUsd: number;
  ngnEquivalent: number;
  monthlyChange: number;
  loading?: boolean;
  className?: string;
}) {
  const [hidden, setHidden] = React.useState(false);
  const [range, setRange] = React.useState<"7D" | "30D">("30D");

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border bg-card p-5 sm:p-6", className)}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-10 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>
    );
  }

  const isPositive = monthlyChange >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-primary-foreground/80">Total balance</p>
        </div>
        <button
          type="button"
          onClick={() => setHidden((h) => !h)}
          className="rounded-lg p-1.5 text-primary-foreground/80 transition-colors hover:bg-white/10"
          aria-label={hidden ? "Show balance" : "Hide balance"}
        >
          {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      <div className="mt-3">
        <AnimatedNumber
          value={totalUsd}
          format={(n) => (hidden ? "••••••" : formatCurrency(n, "USD"))}
          className="text-3xl font-bold tracking-tight sm:text-4xl"
        />
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span className="text-sm text-primary-foreground/80">
          {hidden ? "≈ ••••••" : `≈ ₦${ngnEquivalent.toLocaleString()}`}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
            isPositive ? "bg-white/15" : "bg-white/15",
          )}
        >
          {isPositive ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          {formatPercent(monthlyChange)} this month
        </span>
      </div>

      {/* Range selector — subtle */}
      <div className="mt-5 flex items-center gap-1">
        {(["7D", "30D"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              range === r
                ? "bg-white/20 text-primary-foreground"
                : "text-primary-foreground/70 hover:bg-white/10",
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Subtle trend line */}
      <svg
        viewBox="0 0 300 60"
        className="mt-3 h-12 w-full opacity-30"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,45 L40,40 L80,42 L120,30 L160,32 L200,20 L240,22 L300,10"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M0,45 L40,40 L80,42 L120,30 L160,32 L200,20 L240,22 L300,10 L300,60 L0,60 Z"
          fill="currentColor"
          opacity={0.2}
        />
      </svg>
    </div>
  );
}
