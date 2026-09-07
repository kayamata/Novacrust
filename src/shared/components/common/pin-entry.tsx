"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

/**
 * 4-digit PIN entry pad. Used to confirm sensitive card detail reveals.
 * Mock only — no real PIN is stored or validated.
 */
export function PinEntry({
  length = 4,
  onComplete,
  className,
}: {
  length?: number;
  onComplete: (pin: string) => void;
  className?: string;
}) {
  const [pin, setPin] = React.useState("");

  function press(d: string) {
    if (pin.length >= length) return;
    const next = pin + d;
    setPin(next);
    if (next.length === length) {
      // Slight delay so the last dot is visible.
      setTimeout(() => onComplete(next), 150);
    }
  }

  function backspace() {
    setPin((p) => p.slice(0, -1));
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

  return (
    <div className={cn("flex flex-col items-center gap-5", className)}>
      <div className="flex gap-2.5" aria-label="PIN dots">
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-3 rounded-full transition-colors",
              i < pin.length ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
      <div className="grid w-full max-w-[240px] grid-cols-3 gap-2">
        {keys.map((k, i) => {
          if (k === "") return <div key={i} />;
          if (k === "back") {
            return (
              <button
                key={i}
                type="button"
                onClick={backspace}
                className="flex h-12 items-center justify-center rounded-lg text-lg font-medium text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Backspace"
              >
                ⌫
              </button>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => press(k)}
              className="flex h-12 items-center justify-center rounded-lg text-lg font-semibold text-foreground transition-colors hover:bg-muted active:scale-95"
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}
