/* -------------------------------------------------------------------------- */
/*  App-wide route paths and storage keys.                                     */
/* -------------------------------------------------------------------------- */

export const ROUTES = {
  // Auth
  signin: "/auth/signin",
  signup: "/auth/signup",
  forgotPassword: "/auth/forgot-password",
  // Onboarding
  onboarding: "/onboarding",
  // Main app
  dashboard: "/dashboard",
  wallet: "/wallet",
  walletAsset: (code: string) => `/wallet/${code.toLowerCase()}`,
  send: "/send",
  receive: "/receive",
  deposit: "/deposit",
  withdraw: "/withdraw",
  exchange: "/exchange",
  cards: "/cards",
  cardDetails: (id: string) => `/cards/${id}`,
  giftCards: "/gift-cards",
  globalAccount: "/global-account",
  transactions: "/transactions",
  transactionDetails: (id: string) => `/transactions/${id}`,
  settings: "/settings",
  support: "/support",
} as const;

export const STORAGE_KEYS = {
  auth: "nc_auth",
  user: "nc_user",
  balances: "nc_balances",
  transactions: "nc_transactions",
  cards: "nc_cards",
  recipients: "nc_recipients",
  notifications: "nc_notifications",
  kyc: "nc_kyc",
  onboardingComplete: "nc_onboarding_complete",
  preferences: "nc_preferences",
} as const;

export const DEMO_CREDENTIALS = {
  email: "demo@novacrust.com",
  password: "password123",
} as const;

export const SUPPORTED_COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬", currency: "NGN" as const },
  { code: "GH", name: "Ghana", flag: "🇬🇭", currency: "GHS" as const },
  { code: "KE", name: "Kenya", flag: "🇰🇪", currency: "KES" as const },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" as const },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" as const },
  { code: "EU", name: "Eurozone", flag: "🇪🇺", currency: "EUR" as const },
] as const;

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
] as const;
