"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Plus, ArrowUpRight, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { formatCurrency, currencySymbol } from "@/utils/format";
import { ROUTES } from "@/utils/constants";
import type { Asset, CurrencyCode } from "@/shared/types";

/* -------------------------------------------------------------------------- */
/*  Currency flags                                                             */
/* -------------------------------------------------------------------------- */

const CURRENCY_FLAGS: Partial<Record<CurrencyCode, string>> = {
  NGN: "🇳🇬",
  GBP: "🇬🇧",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GHS: "🇬🇭",
  KES: "🇰🇪",
};

/* -------------------------------------------------------------------------- */
/*  Animated number — smoothly transitions between values                      */
/* -------------------------------------------------------------------------- */

function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  const rafRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const duration = 500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <span className={className}>{format(display)}</span>;
}

/* -------------------------------------------------------------------------- */
/*  Single balance slide                                                       */
/* -------------------------------------------------------------------------- */

function BalanceSlide({
  asset,
  hidden,
  usdEquivalent,
}: {
  asset: Asset;
  hidden: boolean;
  usdEquivalent: number;
}) {
  const symbol = currencySymbol(asset.code);
  const flag = CURRENCY_FLAGS[asset.code];
  const isCryptoSummary = asset.code === "CRYPTO";
  const title = isCryptoSummary ? "Crypto Balance" : `${asset.code} Account`;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground sm:p-6">
      {/* Header row — flag + account name */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {flag ? (
            <span
              className="text-2xl leading-none drop-shadow-sm"
              aria-hidden
            >
              {flag}
            </span>
          ) : (
            <span
              className="text-2xl leading-none"
              aria-hidden
            >
              {asset.glyph ?? symbol}
            </span>
          )}
          <div>
            <p className="text-sm font-semibold leading-tight">{title}</p>
            <p className="text-[0.7rem] leading-tight text-primary-foreground/70">
              {asset.name}
            </p>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="mt-4 flex-1">
        <p className="text-xs font-medium text-primary-foreground/70">Account balance</p>
        <AnimatedNumber
          value={asset.balance}
          format={(n) => (hidden ? "••••••" : formatCurrency(n, asset.code))}
          className="mt-1 block text-3xl font-bold tracking-tight sm:text-4xl"
        />
        {asset.code !== "USD" && !isCryptoSummary && (
          <p className="mt-1.5 text-sm text-primary-foreground/70">
            {hidden ? "≈ ••••••" : `≈ ${formatCurrency(usdEquivalent, "USD")}`}
          </p>
        )}
      </div>

      {/* Subtle trend line */}
      <svg
        viewBox="0 0 300 40"
        className="mt-2 h-8 w-full opacity-20"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,30 L40,25 L80,28 L120,18 L160,20 L200,12 L240,15 L300,5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Action buttons row                                                         */
/* -------------------------------------------------------------------------- */

function ActionButtons({ asset }: { asset: Asset }) {
  const router = useRouter();
  const isCryptoSummary = asset.code === "CRYPTO";

  const actions = isCryptoSummary
    ? [
        {
          label: "Wallet",
          icon: Plus,
          href: ROUTES.wallet,
        },
        {
          label: "Send",
          icon: ArrowUpRight,
          href: ROUTES.send,
        },
        {
          label: "Convert",
          icon: RefreshCw,
          href: ROUTES.exchange,
        },
      ]
    : [
        {
          label: "Add money",
          icon: Plus,
          href: `${ROUTES.deposit}?currency=${asset.code}`,
        },
        {
          label: "Send",
          icon: ArrowUpRight,
          href: `${ROUTES.send}?currency=${asset.code}`,
        },
        {
          label: "Convert",
          icon: RefreshCw,
          href: `${ROUTES.exchange}?currency=${asset.code}`,
        },
      ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => router.push(action.href)}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card py-3 text-center transition-colors hover:bg-muted/50"
        >
          <action.icon className="size-4 text-primary" />
          <span className="text-xs font-medium text-foreground">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Balance carousel                                                           */
/* -------------------------------------------------------------------------- */

export function BalanceCarousel({
  assets,
  loading,
  className,
}: {
  assets: Asset[];
  loading?: boolean;
  className?: string;
}) {
  const [hidden, setHidden] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Update active index based on scroll position.
  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const slideWidth = container.clientWidth;
    const idx = Math.round(container.scrollLeft / slideWidth);
    setActiveIndex(Math.max(0, Math.min(idx, assets.length - 1)));
  }

  // Scroll to a specific slide.
  function scrollToIndex(index: number) {
    const container = scrollRef.current;
    if (!container) return;
    const clamped = Math.max(0, Math.min(index, assets.length - 1));
    container.scrollTo({
      left: clamped * container.clientWidth,
      behavior: "smooth",
    });
  }

  function goPrev() {
    scrollToIndex(activeIndex - 1);
  }

  function goNext() {
    scrollToIndex(activeIndex + 1);
  }

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="h-44 animate-pulse rounded-2xl border border-border bg-muted sm:h-48" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (assets.length === 0) return null;

  const activeAsset = assets[activeIndex];
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < assets.length - 1;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Carousel header — eye toggle + arrows */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setHidden((h) => !h)}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {hidden ? "Show" : "Hide"}
        </button>

        {/* Desktop arrow controls */}
        {assets.length > 1 && (
          <div className="hidden items-center gap-1 sm:flex">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Previous balance"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className="flex size-7 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Next balance"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Scroll container with snap */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {assets.map((asset) => (
          <div
            key={asset.code}
            className="w-full shrink-0 snap-start"
          >
            <div className="h-44 sm:h-48">
              <BalanceSlide
                asset={asset}
                hidden={hidden}
                usdEquivalent={asset.usdValue}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      {assets.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {assets.map((asset, i) => (
            <button
              key={asset.code}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-border hover:bg-muted-foreground/50",
              )}
              aria-label={`Go to ${asset.code} balance`}
            />
          ))}
        </div>
      )}

      {/* Action buttons for the active slide */}
      <ActionButtons asset={activeAsset} />
    </div>
  );
}
