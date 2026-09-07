import { cn } from "@/utils/cn";
import type { Asset } from "@/shared/types";

/**
 * Render an asset icon — a colored tile with the asset's glyph or symbol.
 * Crypto assets use their glyph; cash uses the currency symbol.
 */
export function AssetIcon({
  asset,
  size = "default",
  className,
}: {
  asset: Pick<Asset, "code" | "color" | "glyph" | "symbol" | "kind">;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "size-8 text-xs",
    default: "size-10 text-sm",
    lg: "size-12 text-base",
  };
  const label = asset.glyph ?? asset.symbol ?? asset.code;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        asset.color ?? "bg-muted-foreground",
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {label}
    </div>
  );
}
