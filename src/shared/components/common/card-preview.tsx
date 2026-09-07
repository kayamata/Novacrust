"use client";

import { Snowflake } from "lucide-react";
import { cn } from "@/utils/cn";
import type { VirtualCard } from "@/shared/types";

/**
 * Visual representation of a Novacrust virtual card. Feature-agnostic —
 * used by the dashboard, cards list, and card details pages.
 */
export function CardPreview({
  card,
  compact = false,
  className,
}: {
  card: VirtualCard;
  compact?: boolean;
  className?: string;
}) {
  const frozen = card.status === "frozen";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg transition-all",
        card.gradient,
        frozen && "opacity-60 grayscale",
        compact ? "aspect-[1.6/1] w-full" : "aspect-[1.6/1] w-full max-w-sm",
        className,
      )}
    >
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -right-4 top-12 size-20 rounded-full bg-white/5" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide">NOVACRUST</p>
            <p className="mt-0.5 text-xs uppercase tracking-wider text-white/70">
              {card.label}
            </p>
          </div>
          {frozen && (
            <div className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              <Snowflake className="size-3" />
              Frozen
            </div>
          )}
        </div>

        <div>
          <p className="font-mono text-lg tracking-widest sm:text-xl">{card.maskedNumber}</p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[0.6rem] uppercase tracking-wider text-white/60">Card holder</p>
              <p className="text-sm font-medium">{card.holder}</p>
            </div>
            <div className="text-right">
              <p className="text-[0.6rem] uppercase tracking-wider text-white/60">Expires</p>
              <p className="text-sm font-medium">{card.expiry}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
