"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/providers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import { cn } from "@/utils/cn";

/**
 * Theme toggle — cycles between light, dark, and system.
 * Shows the icon for the current resolved theme.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  /**
   * Wrap setTheme to add a temporary `.theme-anim` class to <html> so the
   * color transition CSS applies during the switch, then remove it after
   * the transition completes to avoid affecting future renders.
   */
  function changeTheme(next: "light" | "dark" | "system") {
    const html = document.documentElement;
    html.classList.add("theme-anim");
    setTheme(next);
    setTimeout(() => html.classList.remove("theme-anim"), 400);
  }

  // Prevent hydration mismatch — render a placeholder until mounted.
  if (!mounted) {
    return (
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg",
          className,
        )}
        aria-hidden
      >
        <Sun className="size-5" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={cn(
              "flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              className,
            )}
            aria-label="Toggle theme"
          />
        }
      >
        {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => changeTheme("light")}
          className={cn(
            "gap-2",
            theme === "light" && "font-semibold",
          )}
        >
          <Sun className="size-4" />
          Light
          {theme === "light" && <span className="ml-auto text-primary">●</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeTheme("dark")}
          className={cn(
            "gap-2",
            theme === "dark" && "font-semibold",
          )}
        >
          <Moon className="size-4" />
          Dark
          {theme === "dark" && <span className="ml-auto text-primary">●</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeTheme("system")}
          className={cn(
            "gap-2",
            theme === "system" && "font-semibold",
          )}
        >
          <Monitor className="size-4" />
          System
          {theme === "system" && <span className="ml-auto text-primary">●</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
