"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

/**
 * Theme provider — wraps next-themes to provide light/dark mode with
 * localStorage persistence and system preference detection.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="nc-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Re-export the useTheme hook from next-themes so consumers import
 * from @/providers rather than reaching into the library directly.
 */
export function useTheme() {
  return useNextTheme();
}
