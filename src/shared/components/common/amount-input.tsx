"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

/**
 * Amount input — large, centered numeric input with a currency/symbol prefix
 * and an optional "Max" button. Parses to a number via onChange.
 */
export function AmountInput({
  value,
  onChange,
  symbol,
  symbolPosition = "left",
  placeholder = "0.00",
  max,
  onMax,
  disabled,
  className,
  autoFocus,
  "aria-label": ariaLabel = "Amount",
}: {
  value: string;
  onChange: (value: string) => void;
  symbol?: string;
  symbolPosition?: "left" | "right";
  placeholder?: string;
  max?: string;
  onMax?: () => void;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  "aria-label"?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  function sanitize(v: string): string {
    // Allow only digits and a single dot.
    const cleaned = v.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return `${parts[0]}.${parts.slice(1).join("")}`;
    return cleaned;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
        disabled && "opacity-60",
        className,
      )}
    >
      {symbol && symbolPosition === "left" && (
        <span className="text-2xl font-semibold text-muted-foreground">{symbol}</span>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={value}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(sanitize(e.target.value))}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/50"
      />
      {symbol && symbolPosition === "right" && (
        <span className="text-2xl font-semibold text-muted-foreground">{symbol}</span>
      )}
      {max && onMax && (
        <button
          type="button"
          onClick={onMax}
          className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          Max
        </button>
      )}
    </div>
  );
}
