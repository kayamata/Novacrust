import type { Asset, CurrencyCode } from "@/shared/types";

/* -------------------------------------------------------------------------- */
/*  Initial asset balances for the demo user.                                  */
/* -------------------------------------------------------------------------- */

export const INITIAL_ASSETS: Asset[] = [
  {
    code: "NGN",
    name: "Nigerian Naira",
    kind: "cash",
    balance: 2450000,
    usdValue: 1666.67,
    change24h: -0.3,
    symbol: "₦",
    subtitle: "Naira Account",
    color: "bg-amber-500",
  },
  {
    code: "USD",
    name: "US Dollar",
    kind: "cash",
    balance: 4820.5,
    usdValue: 4820.5,
    change24h: 0.1,
    symbol: "$",
    subtitle: "USD Account",
    color: "bg-emerald-600",
  },
  {
    code: "GBP",
    name: "British Pound",
    kind: "cash",
    balance: 850,
    usdValue: 1075.95,
    change24h: 0.2,
    symbol: "£",
    subtitle: "GBP Account",
    color: "bg-blue-700",
  },
  {
    code: "USDT",
    name: "Tether",
    kind: "stablecoin",
    balance: 1850,
    usdValue: 1850,
    change24h: 0.01,
    symbol: "$",
    subtitle: "TRC20 · ERC20",
    glyph: "₮",
    color: "bg-green-600",
    networks: ["TRC20", "ERC20", "BEP20"],
  },
  {
    code: "USDC",
    name: "USD Coin",
    kind: "stablecoin",
    balance: 1250,
    usdValue: 1250,
    change24h: 0.0,
    symbol: "$",
    subtitle: "ERC20 · Solana",
    glyph: "₵",
    color: "bg-blue-600",
    networks: ["ERC20", "Solana", "BEP20"],
  },
  {
    code: "BTC",
    name: "Bitcoin",
    kind: "crypto",
    balance: 0.005234,
    usdValue: 500,
    change24h: 2.4,
    symbol: "₿",
    subtitle: "Bitcoin network",
    glyph: "₿",
    color: "bg-orange-500",
    networks: ["Bitcoin"],
  },
  {
    code: "ETH",
    name: "Ethereum",
    kind: "crypto",
    balance: 0.128,
    usdValue: 320,
    change24h: -1.2,
    symbol: "Ξ",
    subtitle: "ERC20 network",
    glyph: "Ξ",
    color: "bg-indigo-500",
    networks: ["Ethereum", "ERC20"],
  },
];

/** Quick lookup map for a single asset by code. */
export const ASSET_MAP: Record<string, Asset> = INITIAL_ASSETS.reduce(
  (acc, asset) => {
    acc[asset.code] = asset;
    return acc;
  },
  {} as Record<string, Asset>,
);

/** Approximate USD exchange rates used across the app. */
export const USD_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  NGN: 1470,
  EUR: 0.92,
  GBP: 0.79,
  GHS: 15.2,
  KES: 129,
  USDT: 1,
  USDC: 1,
  BTC: 0.00001046,
  ETH: 0.0004,
  SOL: 0.0066,
  CRYPTO: 1,
};

/** Convert an amount from one currency to another using USD as the bridge. */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  const inUsd = amount / USD_RATES[from];
  return inUsd * USD_RATES[to];
}
