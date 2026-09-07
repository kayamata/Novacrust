import { cn } from "@/utils/cn";

/**
 * A labeled value row used in review/summary screens.
 */
export function ReviewRow({
  label,
  value,
  hint,
  emphasize,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  emphasize?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 py-2.5",
        emphasize && "border-t border-border pt-3 mt-1",
        className,
      )}
    >
      <div className="min-w-0">
        <p className={cn("text-sm", emphasize ? "font-medium text-foreground" : "text-muted-foreground")}>
          {label}
        </p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div
        className={cn(
          "shrink-0 text-right text-sm tabular-nums",
          emphasize ? "text-base font-semibold text-foreground" : "font-medium text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}
