import type { VirtualCard, Recipient, AppNotification, GiftCard, UserProfile, SupportTopic } from "@/shared/types";

// Re-export asset & transaction seed data from sibling modules.
export { INITIAL_ASSETS, ASSET_MAP, USD_RATES, convertCurrency } from "@/shared/data/assets";
export { INITIAL_TRANSACTIONS } from "@/shared/data/transactions";

/* -------------------------------------------------------------------------- */
/*  Virtual cards                                                              */
/* -------------------------------------------------------------------------- */

export const INITIAL_CARDS: VirtualCard[] = [
  {
    id: "card_virtual_1",
    brand: "Novacrust",
    type: "virtual",
    label: "Virtual",
    number: "4532 9182 4928 4829",
    maskedNumber: "•••• 4829",
    expiry: "09/29",
    cvv: "284",
    holder: "ALEX MORGAN",
    balance: 2450,
    currency: "USD",
    status: "active",
    monthlyLimit: 10000,
    spentThisMonth: 37.98,
    gradient: "from-teal-700 via-teal-800 to-slate-900",
  },
];

/* -------------------------------------------------------------------------- */
/*  Saved recipients                                                           */
/* -------------------------------------------------------------------------- */

export const INITIAL_RECIPIENTS: Recipient[] = [
  {
    id: "rcp_001",
    name: "Thelma Okafor",
    accountNumber: "0123456789",
    bank: "GTBank",
    country: "Nigeria",
    countryCode: "NG",
    currency: "NGN",
    saved: true,
    avatarColor: "bg-teal-500",
  },
  {
    id: "rcp_002",
    name: "Sam Anderson",
    walletAddress: "0x4f8a1c2b3d4e5f6789012345abcdef67890181a2",
    network: "ERC20",
    country: "United States",
    countryCode: "US",
    currency: "USDT",
    saved: true,
    avatarColor: "bg-purple-500",
  },
  {
    id: "rcp_003",
    name: "John Doe",
    walletAddress: "TX7xK9pQ2mN4rL6sW8yH0b3vF5cD8H2K",
    network: "TRC20",
    country: "United Kingdom",
    countryCode: "GB",
    currency: "USDT",
    saved: true,
    avatarColor: "bg-blue-500",
  },
];

/* -------------------------------------------------------------------------- */
/*  Notifications                                                              */
/* -------------------------------------------------------------------------- */

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "ntf_001",
    type: "transaction",
    title: "$1,200 received",
    message: "Your transfer from John Doe has arrived.",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "ntf_002",
    type: "card",
    title: "Card payment",
    message: "$15.99 spent at Netflix.",
    date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "ntf_003",
    type: "verification",
    title: "Verification complete",
    message: "Your identity has been verified successfully.",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: "ntf_004",
    type: "security",
    title: "New login detected",
    message: "A new login from Lagos, Nigeria on Chrome.",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

/* -------------------------------------------------------------------------- */
/*  Gift cards                                                                 */
/* -------------------------------------------------------------------------- */

export const GIFT_CARDS: GiftCard[] = [
  {
    id: "gc_amazon",
    brand: "Amazon",
    color: "bg-orange-500",
    denominations: [25, 50, 100, 200, 500],
    buyDiscount: 1.5,
    sellPayout: 82,
    glyph: "a",
  },
  {
    id: "gc_apple",
    brand: "Apple",
    color: "bg-gray-800",
    denominations: [25, 50, 100, 200],
    buyDiscount: 2,
    sellPayout: 80,
    glyph: "",
  },
  {
    id: "gc_google",
    brand: "Google Play",
    color: "bg-green-600",
    denominations: [25, 50, 100],
    buyDiscount: 1.5,
    sellPayout: 81,
    glyph: "G",
  },
  {
    id: "gc_steam",
    brand: "Steam",
    color: "bg-slate-700",
    denominations: [20, 50, 100],
    buyDiscount: 2.5,
    sellPayout: 78,
    glyph: "S",
  },
  {
    id: "gc_netflix",
    brand: "Netflix",
    color: "bg-red-600",
    denominations: [25, 50, 100],
    buyDiscount: 1,
    sellPayout: 83,
    glyph: "N",
  },
];

/* -------------------------------------------------------------------------- */
/*  Demo user profile                                                          */
/* -------------------------------------------------------------------------- */

export const DEMO_USER: UserProfile = {
  id: "user_demo_001",
  firstName: "Alex",
  lastName: "Morgan",
  email: "demo@novacrust.com",
  phone: "+234 803 123 4567",
  country: "Nigeria",
  countryCode: "NG",
  avatarColor: "bg-teal-600",
  verified: true,
  kycStatus: "verified",
  kycDocuments: [
    {
      type: "national_id",
      label: "National ID",
      fileName: "national_id_front.jpg",
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  preferences: {
    displayCurrency: "USD",
    language: "en",
    notifications: {
      email: true,
      push: true,
      transactions: true,
      security: true,
    },
  },
};

/* -------------------------------------------------------------------------- */
/*  Support topics                                                             */
/* -------------------------------------------------------------------------- */

export const SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: "topic_deposits",
    title: "How do I deposit crypto?",
    category: "Deposits",
    content:
      "To deposit crypto, go to Add money → Crypto, choose your asset and network, then send funds to the displayed deposit address. Crypto deposits usually arrive within a few minutes after network confirmation. Always send only the matching asset on the matching network.",
  },
  {
    id: "topic_withdrawals",
    title: "How long do withdrawals take?",
    category: "Withdrawals",
    content:
      "Bank withdrawals typically arrive within 1–2 business days. Mobile money and crypto withdrawals are usually instant. You can track the status of any withdrawal from your Transactions page.",
  },
  {
    id: "topic_cards",
    title: "How do I get a virtual card?",
    category: "Cards",
    content:
      "Virtual cards are available to verified users. Once your identity is verified, you can request a virtual card from the Cards page. Your card can be used online anywhere Visa/Mastercard is accepted.",
  },
  {
    id: "topic_transfers",
    title: "What are the transfer limits?",
    category: "Transfers",
    content:
      "Verified accounts can send up to $50,000 per day and deposit up to $250,000 per month. Card spending is limited to $10,000 per month. You can view your current limits in Settings → Verification.",
  },
  {
    id: "topic_verification",
    title: "How long does verification take?",
    category: "Verification",
    content:
      "Identity verification usually completes within a few minutes after you upload your government-issued ID. If it has been longer than 24 hours, please reach out to support and we'll look into it.",
  },
  {
    id: "topic_crypto",
    title: "Which networks are supported?",
    category: "Crypto",
    content:
      "Novacrust supports TRC20, ERC20, BEP20, Solana, Bitcoin, and Ethereum networks depending on the asset. Always double-check the network before sending — sending on the wrong network may result in permanent loss.",
  },
];

export const SUPPORT_CATEGORIES = [
  { id: "deposits", label: "Deposits", icon: "Wallet" as const },
  { id: "withdrawals", label: "Withdrawals", icon: "Banknote" as const },
  { id: "cards", label: "Cards", icon: "CreditCard" as const },
  { id: "transfers", label: "Transfers", icon: "ArrowUpRight" as const },
  { id: "verification", label: "Verification", icon: "ShieldCheck" as const },
  { id: "crypto", label: "Crypto", icon: "Wallet" as const },
];

/* -------------------------------------------------------------------------- */
/*  Global account details (mock)                                              */
/* -------------------------------------------------------------------------- */

export const GLOBAL_ACCOUNTS = [
  {
    currency: "USD" as const,
    status: "active" as const,
    accountName: "Alex Morgan",
    accountNumber: "004829182",
    routingNumber: "021000021",
    bank: "Novacrust Partner Bank",
    note: "Receive USD payments via ACH or Wire",
  },
  {
    currency: "EUR" as const,
    status: "coming_soon" as const,
    accountName: "Alex Morgan",
    accountNumber: "—",
    routingNumber: "—",
    bank: "Novacrust Partner Bank",
    note: "EUR account coming soon",
  },
  {
    currency: "GBP" as const,
    status: "coming_soon" as const,
    accountName: "Alex Morgan",
    accountNumber: "—",
    routingNumber: "—",
    bank: "Novacrust Partner Bank",
    note: "GBP account coming soon",
  },
];

/* -------------------------------------------------------------------------- */
/*  Mock bank account (for receive / deposit)                                  */
/* -------------------------------------------------------------------------- */

export const MOCK_BANK_ACCOUNT = {
  accountName: "Alex Morgan",
  accountNumber: "004829182",
  routingNumber: "021000021",
  bank: "Novacrust Partner Bank",
};
