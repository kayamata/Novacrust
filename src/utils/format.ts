import type { CurrencyCode } from "@/shared/types";

/* -------------------------------------------------------------------------- */
/*  Currency formatting                                                        */
/* -------------------------------------------------------------------------- */

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: "$",
  NGN: "₦",
  EUR: "€",
  GBP: "£",
  GHS: "₵",
  KES: "KSh",
  USDT: "$",
  USDC: "$",
  BTC: "₿",
  ETH: "Ξ",
  SOL: "◎",
  CRYPTO: "$",
};

const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  USD: "en-US",
  NGN: "en-NG",
  EUR: "en-IE",
  GBP: "en-GB",
  GHS: "en-GH",
  KES: "en-KE",
  USDT: "en-US",
  USDC: "en-US",
  BTC: "en-US",
  ETH: "en-US",
  SOL: "en-US",
  CRYPTO: "en-US",
};

const CRYPTO_CURRENCIES: CurrencyCode[] = ["BTC", "ETH", "SOL", "USDT", "USDC"];

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCY_SYMBOLS[code] ?? "";
}

export function isCrypto(code: CurrencyCode): boolean {
  return CRYPTO_CURRENCIES.includes(code);
}

/** Format a number as a currency amount (e.g. 4820.5 → "$4,820.50"). */
export function formatCurrency(
  amount: number,
  code: CurrencyCode = "USD",
  opts: { showSymbol?: boolean; showCode?: boolean; compact?: boolean } = {},
): string {
  const { showSymbol = true, showCode = false, compact = false } = opts;
  const symbol = showSymbol ? currencySymbol(code) : "";
  const fractionDigits = isCrypto(code) && code !== "USDT" && code !== "USDC" ? 6 : 2;
  const maxDigits = compact ? 1 : fractionDigits;
  const minDigits = compact ? 0 : 2;

  const formatted = new Intl.NumberFormat(CURRENCY_LOCALES[code], {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
    notation: compact ? "compact" : "standard",
  }).format(Math.abs(amount));

  const sign = amount < 0 ? "-" : "";
  const codeSuffix = showCode ? ` ${code}` : "";
  return `${sign}${symbol}${formatted}${codeSuffix}`;
}

/** Format a USD value compactly (e.g. 12450000 → "≈ ₦12.45M"). */
export function formatUsdEquivalent(
  usdValue: number,
  code: CurrencyCode = "USD",
): string {
  const symbol = currencySymbol(code);
  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(usdValue);
  return `≈ ${symbol}${formatted}`;
}

/** Format a percentage change (e.g. 2.8 → "+2.8%"). */
export function formatPercent(value: number, withSign = true): string {
  const sign = value > 0 && withSign ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/* -------------------------------------------------------------------------- */
/*  Date formatting                                                            */
/* -------------------------------------------------------------------------- */

export function formatDate(
  date: string | Date,
  style: "short" | "long" | "time" | "datetime" | "relative" = "short",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (style === "relative") {
    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  if (style === "time") {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (style === "datetime") {
    if (isToday) {
      return `Today · ${formatDate(d, "time")}`;
    }
    if (isYesterday) {
      return `Yesterday · ${formatDate(d, "time")}`;
    }
    return `${d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} · ${formatDate(d, "time")}`;
  }

  if (style === "long") {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/*  Address / reference helpers                                                */
/* -------------------------------------------------------------------------- */

/** Truncate a wallet address in the middle (e.g. "TX7x...8H2K"). */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Mask a card number, showing only the last 4 digits. */
export function maskCardNumber(number: string): string {
  const digits = number.replace(/\s/g, "");
  if (digits.length < 4) return number;
  return `•••• ${digits.slice(-4)}`;
}

/** Group a card number into 4-digit chunks. */
export function groupCardNumber(number: string): string {
  return number.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}

/** Generate a transaction reference like "NC-928182". */
export function generateReference(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `NC-${num}`;
}

/** Generate a pseudo transaction id. */
export function generateId(prefix = "tx"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Generate a pseudo wallet address. */
export function generateWalletAddress(network: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
  const length = network === "Bitcoin" ? 34 : network === "Ethereum" ? 42 : 34;
  let result = "";
  if (network === "Ethereum" || network === "ERC20") result = "0x";
  for (let i = result.length; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/** Get the user's initials from a name. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Get a greeting based on the current hour. */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
