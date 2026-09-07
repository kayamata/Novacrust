import { cn } from "@/utils/cn";

/**
 * Novacrust logo — a simple, clean mark. A hexagonal "crust" shape with
 * an inner diamond, rendered in the brand teal.
 */
export function Logo({
  className,
  showText = true,
  size = "default",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "default" | "lg";
}) {
  const markSize = size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-8";
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
          markSize,
        )}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-1/2"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
          <path d="M12 7 7.5 9.5v5L12 17l4.5-2.5v-5L12 7Z" />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-semibold tracking-tight text-foreground", textSize)}>
          Novacrust
        </span>
      )}
    </div>
  );
}
