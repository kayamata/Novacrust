import { InfoIcon } from "lucide-react";
import { Badge } from "@/shared/components/ui";

/**
 * Subtle indicator that the app is running in demo mode — all transactions
 * are simulated and balances are mock data.
 */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 border-primary/20 bg-primary/5 text-primary ${className ?? ""}`}
    >
      <InfoIcon className="size-3" />
      Demo Mode
    </Badge>
  );
}
