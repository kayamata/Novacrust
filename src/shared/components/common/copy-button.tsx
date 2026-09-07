"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

/**
 * Copy-to-clipboard button with a check microinteraction and toast.
 */
export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  toastLabel = "Copied to clipboard",
  className,
  size = "default",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  toastLabel?: string;
  className?: string;
  size?: "sm" | "default";
}) {
  const [copied, setCopied] = React.useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for environments without clipboard API.
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    toast.success(toastLabel);
    setTimeout(() => setCopied(false), 1800);
  }

  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted",
        className,
      )}
      aria-label={copied ? copiedLabel : label}
    >
      {copied ? (
        <Check className={cn(iconSize, "text-success")} />
      ) : (
        <Copy className={iconSize} />
      )}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}
