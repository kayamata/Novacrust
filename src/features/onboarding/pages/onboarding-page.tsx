"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Globe } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/shared/components/layout";
import { Button } from "@/shared/components/ui";
import { useAuth, useAppStore } from "@/providers";
import { ROUTES } from "@/utils/constants";
import { cn } from "@/utils/cn";

type Step = 0 | 1 | 2 | 3;

const COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "OTHER", name: "Other", flag: "🌍" },
];

const USES = [
  { id: "receive", label: "Receive money" },
  { id: "send", label: "Send money" },
  { id: "crypto", label: "Crypto" },
  { id: "international", label: "International payments" },
  { id: "all", label: "All of the above" },
];

export function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const { updateUser } = useAppStore();
  const [step, setStep] = React.useState<Step>(0);
  const [country, setCountry] = React.useState<string>("");
  const [uses, setUses] = React.useState<string[]>([]);

  function next() {
    if (step === 1 && !country) {
      toast.error("Please select where you're based.");
      return;
    }
    if (step === 2 && uses.length === 0) {
      toast.error("Please select at least one option.");
      return;
    }
    if (step === 1 && country) {
      updateUser({ country });
    }
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
    }
  }

  function finish() {
    completeOnboarding();
    toast.success("Your account is set up.");
    router.replace(ROUTES.dashboard);
  }

  function toggleUse(id: string) {
    setUses((prev) =>
      id === "all"
        ? ["all"]
        : prev.includes(id)
          ? prev.filter((u) => u !== id)
          : [...prev.filter((u) => u !== "all"), id],
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md py-6">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <div className="flex flex-col items-center gap-6 py-8 text-center nc-animate-fade-in">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Globe className="size-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Welcome to Novacrust
              </h1>
              <p className="text-sm text-muted-foreground">
                Move your money globally, without the complexity.
              </p>
            </div>
            <Button size="lg" onClick={next} className="w-full max-w-xs">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Step 1 — Country */}
        {step === 1 && (
          <div className="flex flex-col gap-6 py-4 nc-animate-fade-in">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Where are you based?
              </h1>
              <p className="text-sm text-muted-foreground">
                We&apos;ll tailor your experience based on your location.
              </p>
            </div>
            <div className="space-y-2.5">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCountry(c.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                    country === c.name
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="text-2xl">{c.flag}</span>
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {c.name}
                  </span>
                  {country === c.name && (
                    <Check className="size-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
            <Button size="lg" onClick={next} className="w-full">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Step 2 — Use case */}
        {step === 2 && (
          <div className="flex flex-col gap-6 py-4 nc-animate-fade-in">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                What do you want to use Novacrust for?
              </h1>
              <p className="text-sm text-muted-foreground">
                Select all that apply. You can change this later.
              </p>
            </div>
            <div className="space-y-2.5">
              {USES.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleUse(u.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                    uses.includes(u.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {u.label}
                  </span>
                  {uses.includes(u.id) && <Check className="size-5 text-primary" />}
                </button>
              ))}
            </div>
            <Button size="lg" onClick={next} className="w-full">
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Step 3 — Ready */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-6 py-8 text-center nc-animate-scale-in">
            <div className="nc-check-circle flex size-16 items-center justify-center rounded-full bg-success/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-8 text-success"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" className="nc-check-path" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                You&apos;re ready.
              </h1>
              <p className="text-sm text-muted-foreground">
                Your account is set up. Let&apos;s move some money.
              </p>
            </div>
            <Button size="lg" onClick={finish} className="w-full max-w-xs">
              Go to dashboard
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
