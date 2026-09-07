"use client";

import { AuthShell } from "@/shared/components/layout";
import { SignInForm } from "@/features/auth/components";

export function SignInPage() {
  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your Novacrust account.
          </p>
        </div>
        <SignInForm />
      </div>
    </AuthShell>
  );
}
