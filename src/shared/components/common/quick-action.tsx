"use client";

import Link from "next/link";
import { cn } from "@/utils/cn";

/**
 * Quick action tile — icon + label + optional description. Used on the
 * dashboard and on action-picker screens.
 */
export function QuickAction({
  icon: Icon,
  label,
  description,
  href,
  onClick,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover/action:bg-primary group-hover/action:text-primary-foreground">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="truncate text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </>
  );

  const classes = cn(
    "group/action flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left transition-all hover:border-primary/30 hover:shadow-sm active:scale-[0.99]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
