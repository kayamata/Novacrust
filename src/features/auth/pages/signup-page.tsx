"use client";

import { AuthShell } from "@/shared/components/layout";
import { SignUpForm } from "@/features/auth/components";

export function SignUpPage() {
  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Move your money globally, without the complexity.
          </p>
        </div>
        <SignUpForm />
      </div>
    </AuthShell>
  );
}
