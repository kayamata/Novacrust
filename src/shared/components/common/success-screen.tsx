"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui";
import { cn } from "@/utils/cn";

/**
 * Success screen — animated checkmark + summary + next actions.
 * Used at the end of financial flows (send, withdraw, exchange, etc.).
 */
export function SuccessScreen({
  title,
  description,
  amount,
  primaryActionLabel = "Done",
  primaryActionHref,
  secondaryActionLabel,
  secondaryActionHref,
  className,
}: {
  title: string;
  description?: string;
  amount?: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center nc-animate-scale-in",
        className,
      )}
    >
      <div className="nc-check-circle flex size-16 items-center justify-center rounded-full bg-success/10">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-8 text-success"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" className="nc-check-path" />
        </svg>
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {amount && (
          <p className="text-2xl font-bold tracking-tight text-foreground">{amount}</p>
        )}
        {description && (
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
        {primaryActionHref && (
          <Button className="w-full" onClick={() => router.push(primaryActionHref)}>
            {primaryActionLabel}
          </Button>
        )}
        {secondaryActionHref && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push(secondaryActionHref)}
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
