"use client";

import { AuthShell } from "@/shared/components/layout";
import { ForgotPasswordForm } from "@/features/auth/components";

export function ForgotPasswordPage() {
  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Forgot your password?
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </AuthShell>
  );
}
