"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster as Sonner } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react";
import { ReactQueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { AppStoreProvider } from "@/providers/app-store-provider";
import { ThemeProvider, useTheme } from "@/providers/theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Toast notifications — wired here (not via @/shared/components) because the
 * providers layer is a leaf that cannot import from @/shared/components/*.
 */
function Toaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={(resolvedTheme as "light" | "dark") ?? "light"}
      position="top-center"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{ classNames: { toast: "nc-toast" } }}
    />
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ReactQueryProvider>
          <AuthProvider>
            <AppStoreProvider>
              {children}
              <Toaster />
            </AppStoreProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
