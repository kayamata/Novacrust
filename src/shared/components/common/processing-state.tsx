import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Processing state — subtle spinner with a message.
 * Used during simulated financial actions.
 */
export function ProcessingState({
  title = "Processing…",
  description = "Please don't close this window.",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
