/* -------------------------------------------------------------------------- */
/*  Global domain types                                                        */
/*  Cross-feature shapes used across the Novacrust prototype.                  */
/* -------------------------------------------------------------------------- */

export type CurrencyCode =
  | "USD"
  | "NGN"
  | "EUR"
  | "GBP"
  | "GHS"
  | "KES"
  | "USDT"
  | "USDC"
  | "BTC"
  | "ETH"
  | "SOL"
  | "CRYPTO";

export type AssetKind = "cash" | "crypto" | "stablecoin";

export type CryptoNetwork =
  | "TRC20"
  | "ERC20"
  | "BEP20"
  | "Solana"
  | "Bitcoin"
  | "Ethereum";

export interface Asset {
  code: CurrencyCode;
  name: string;
  kind: AssetKind;
  /** Native balance (e.g. 0.005 BTC, 1850 USDT, 4820.50 USD). */
  balance: number;
  /** USD-equivalent value of the holdings. */
  usdValue: number;
  /** 24h change percentage. */
  change24h: number;
  /** Symbol shown next to amounts ($, ₦, €, £, ₿, Ξ). */
  symbol: string;
  /** Optional ticker / sub-label (e.g. "Tether", "USD Coin"). */
  subtitle?: string;
  /** Approximate deposit/withdrawal networks supported. */
  networks?: CryptoNetwork[];
  /** Background color hint for the icon tile (tailwind class). */
  color?: string;
  /** Glyph for crypto assets (e.g. ₿, Ξ, ₮). */
  glyph?: string;
}

export type TransactionType =
  | "received"
  | "sent"
  | "exchange"
  | "withdrawal"
  | "deposit"
  | "card"
  | "fee";

export type TransactionStatus = "completed" | "pending" | "failed";

export type TransactionDirection = "in" | "out" | "neutral";

export interface TransactionParty {
  name: string;
  /** Optional secondary identifier (account number, wallet, merchant). */
  detail?: string;
  avatarColor?: string;
}

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  direction: TransactionDirection;
  /** Display title (e.g. "Received USDT", "Netflix"). */
  title: string;
  /** Optional subtitle (e.g. "From John Doe", "TRON network"). */
  subtitle?: string;
  /** Amount in the transaction currency (positive number). */
  amount: number;
  /** Currency of the amount. */
  currency: CurrencyCode;
  /** USD-equivalent value at the time of the transaction. */
  usdValue: number;
  /** ISO timestamp. */
  date: string;
  /** Counterparty, if any. */
  counterparty?: TransactionParty;
  /** Network used (for crypto). */
  network?: CryptoNetwork;
  /** Fee charged (in transaction currency). */
  fee?: number;
  /** Fee currency (defaults to the transaction currency). */
  feeCurrency?: CurrencyCode;
  /** Exchange rate, if this is an exchange. */
  exchangeRate?: number;
  /** For exchanges: the from currency. */
  fromCurrency?: CurrencyCode;
  /** For exchanges: the to currency. */
  toCurrency?: CurrencyCode;
  /** For exchanges: the from amount. */
  fromAmount?: number;
  /** For exchanges: the to amount. */
  toAmount?: number;
  /** Asset code this transaction relates to (for filtering by asset). */
  assetCode?: CurrencyCode;
  /** Optional note. */
  note?: string;
}

export type CardStatus = "active" | "frozen" | "blocked";

export interface VirtualCard {
  id: string;
  brand: "Novacrust";
  type: "virtual";
  label: string;
  number: string;
  maskedNumber: string;
  expiry: string;
  cvv: string;
  holder: string;
  balance: number;
  currency: CurrencyCode;
  status: CardStatus;
  monthlyLimit: number;
  spentThisMonth: number;
  /** Tailwind gradient classes for the card face. */
  gradient: string;
}

export interface Recipient {
  id: string;
  name: string;
  /** Bank / wallet / mobile money identifier. */
  accountNumber?: string;
  bank?: string;
  routingNumber?: string;
  walletAddress?: string;
  network?: CryptoNetwork;
  country: string;
  countryCode: string;
  currency: CurrencyCode;
  saved: boolean;
  avatarColor?: string;
}

export type NotificationType =
  | "transaction"
  | "card"
  | "security"
  | "verification"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  /** Fee as a fraction (0.005 = 0.5%). */
  feeRate: number;
  /** Fixed fee in the source currency. */
  fixedFee: number;
}

export interface GiftCard {
  id: string;
  brand: string;
  /** Tailwind class for the brand color tile. */
  color: string;
  /** Available denominations to buy. */
  denominations: number[];
  /** Discount when buying (e.g. 1.5% off face value). */
  buyDiscount: number;
  /** Payout percentage when selling (e.g. 82% of face value). */
  sellPayout: number;
  glyph?: string;
}

export type KycStatus = "unverified" | "under_review" | "verified" | "rejected";

export interface KycDocument {
  type: "passport" | "national_id" | "drivers_license";
  label: string;
  fileName?: string;
  uploadedAt?: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  countryCode: string;
  avatarColor: string;
  verified: boolean;
  kycStatus: KycStatus;
  kycDocuments: KycDocument[];
  createdAt: string;
  preferences: {
    displayCurrency: CurrencyCode;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      transactions: boolean;
      security: boolean;
    };
  };
}

export interface SupportMessage {
  id: string;
  sender: "user" | "support";
  text: string;
  date: string;
}

export interface SupportTopic {
  id: string;
  title: string;
  category: string;
  content: string;
}
