"use client";

import * as React from "react";
import type {
  Asset,
  Transaction,
  VirtualCard,
  Recipient,
  AppNotification,
  UserProfile,
  CurrencyCode,
  CryptoNetwork,
  KycStatus,
  KycDocument,
  TransactionType,
  TransactionDirection,
} from "@/shared/types";
import {
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
  INITIAL_CARDS,
  INITIAL_RECIPIENTS,
  INITIAL_NOTIFICATIONS,
  DEMO_USER,
} from "@/shared/data";
import { STORAGE_KEYS, DATA_VERSION } from "@/utils/constants";
import { generateId, generateReference } from "@/utils/format";
import { convertCurrency, USD_RATES } from "@/shared/data/assets";

/* -------------------------------------------------------------------------- */
/*  Store shape & actions                                                      */
/* -------------------------------------------------------------------------- */

interface SendCryptoInput {
  assetCode: CurrencyCode;
  amount: number;
  recipientAddress: string;
  network: CryptoNetwork;
  note?: string;
}

interface SendMoneyInput {
  fromCurrency: CurrencyCode;
  amount: number;
  recipient: Recipient;
  note?: string;
}

interface DepositCryptoInput {
  assetCode: CurrencyCode;
  amount: number;
  network: CryptoNetwork;
}

interface WithdrawInput {
  fromCurrency: CurrencyCode;
  amount: number;
  method: "bank" | "mobile" | "crypto";
  recipient: Recipient;
}

interface ExchangeInput {
  from: CurrencyCode;
  to: CurrencyCode;
  amount: number;
}

interface AppStoreState {
  assets: Asset[];
  transactions: Transaction[];
  cards: VirtualCard[];
  recipients: Recipient[];
  notifications: AppNotification[];
  user: UserProfile;
  hydrated: boolean;
}

interface AppStoreContext extends AppStoreState {
  // Derived
  totalUsdBalance: number;
  getAsset: (code: CurrencyCode) => Asset | undefined;
  getTransactionsForAsset: (code: CurrencyCode) => Transaction[];
  getTransaction: (id: string) => Transaction | undefined;
  unreadNotificationCount: number;

  // Actions — financial
  sendCrypto: (input: SendCryptoInput) => Promise<Transaction>;
  sendMoney: (input: SendMoneyInput) => Promise<Transaction>;
  depositCrypto: (input: DepositCryptoInput) => Promise<Transaction>;
  withdraw: (input: WithdrawInput) => Promise<Transaction>;
  exchange: (input: ExchangeInput) => Promise<Transaction>;

  // Actions — cards
  freezeCard: (id: string) => Promise<void>;
  unfreezeCard: (id: string) => Promise<void>;

  // Actions — recipients
  addRecipient: (recipient: Omit<Recipient, "id">) => Recipient;
  removeRecipient: (id: string) => void;

  // Actions — notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<AppNotification, "id" | "date" | "read">) => void;

  // Actions — user / settings
  updateUser: (patch: Partial<UserProfile>) => void;
  updatePreferences: (patch: Partial<UserProfile["preferences"]>) => void;
  updateNotificationPreferences: (
    patch: Partial<UserProfile["preferences"]["notifications"]>,
  ) => void;
  submitKyc: (docs: KycDocument[]) => Promise<void>;
  simulateKycComplete: () => void;

  // Reset
  resetToDefaults: () => void;
}

const AppStoreContext = React.createContext<AppStoreContext | null>(null);

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildTransaction(partial: {
  type: TransactionType;
  direction: TransactionDirection;
  title: string;
  subtitle?: string;
  amount: number;
  currency: CurrencyCode;
  usdValue: number;
  counterparty?: Transaction["counterparty"];
  network?: CryptoNetwork;
  fee?: number;
  feeCurrency?: CurrencyCode;
  exchangeRate?: number;
  fromCurrency?: CurrencyCode;
  toCurrency?: CurrencyCode;
  fromAmount?: number;
  toAmount?: number;
  assetCode?: CurrencyCode;
  note?: string;
}): Transaction {
  return {
    id: generateId("tx"),
    reference: generateReference(),
    status: "completed",
    date: new Date().toISOString(),
    ...partial,
  };
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppStoreState>({
    assets: INITIAL_ASSETS,
    transactions: INITIAL_TRANSACTIONS,
    cards: INITIAL_CARDS,
    recipients: INITIAL_RECIPIENTS,
    notifications: INITIAL_NOTIFICATIONS,
    user: DEMO_USER,
    hydrated: false,
  });

  // Hydrate from localStorage on mount.
  React.useEffect(() => {
    // Check data version — if it changed, re-seed all mock data.
    const storedVersion = loadState<string>(STORAGE_KEYS.dataVersion, "");
    const isStale = storedVersion !== DATA_VERSION;

    const assets = isStale ? INITIAL_ASSETS : loadState(STORAGE_KEYS.balances, INITIAL_ASSETS);
    const transactions = isStale
      ? INITIAL_TRANSACTIONS
      : loadState(STORAGE_KEYS.transactions, INITIAL_TRANSACTIONS);
    const cards = isStale ? INITIAL_CARDS : loadState(STORAGE_KEYS.cards, INITIAL_CARDS);
    const recipients = isStale
      ? INITIAL_RECIPIENTS
      : loadState(STORAGE_KEYS.recipients, INITIAL_RECIPIENTS);
    const notifications = isStale
      ? INITIAL_NOTIFICATIONS
      : loadState(STORAGE_KEYS.notifications, INITIAL_NOTIFICATIONS);
    const user = isStale ? DEMO_USER : loadState(STORAGE_KEYS.user, DEMO_USER);

    if (isStale) {
      saveState(STORAGE_KEYS.dataVersion, DATA_VERSION);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      assets,
      transactions,
      cards,
      recipients,
      notifications,
      user,
      hydrated: true,
    });
  }, []);

  // Persist on change (after hydration).
  React.useEffect(() => {
    if (!state.hydrated) return;
    saveState(STORAGE_KEYS.balances, state.assets);
  }, [state.assets, state.hydrated]);

  React.useEffect(() => {
    if (!state.hydrated) return;
    saveState(STORAGE_KEYS.transactions, state.transactions);
  }, [state.transactions, state.hydrated]);

  React.useEffect(() => {
    if (!state.hydrated) return;
    saveState(STORAGE_KEYS.cards, state.cards);
  }, [state.cards, state.hydrated]);

  React.useEffect(() => {
    if (!state.hydrated) return;
    saveState(STORAGE_KEYS.recipients, state.recipients);
  }, [state.recipients, state.hydrated]);

  React.useEffect(() => {
    if (!state.hydrated) return;
    saveState(STORAGE_KEYS.notifications, state.notifications);
  }, [state.notifications, state.hydrated]);

  React.useEffect(() => {
    if (!state.hydrated) return;
    saveState(STORAGE_KEYS.user, state.user);
  }, [state.user, state.hydrated]);

  /* ---------------------------------------------------------------------- */
  /*  Derived values                                                        */
  /* ---------------------------------------------------------------------- */

  const totalUsdBalance = React.useMemo(
    () => state.assets.reduce((sum, a) => sum + a.usdValue, 0),
    [state.assets],
  );

  const getAsset = React.useCallback(
    (code: CurrencyCode) => state.assets.find((a) => a.code === code),
    [state.assets],
  );

  const getTransactionsForAsset = React.useCallback(
    (code: CurrencyCode) =>
      state.transactions.filter(
        (t) => t.assetCode === code || t.currency === code,
      ),
    [state.transactions],
  );

  const getTransaction = React.useCallback(
    (id: string) => state.transactions.find((t) => t.id === id),
    [state.transactions],
  );

  const unreadNotificationCount = React.useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications],
  );

  /* ---------------------------------------------------------------------- */
  /*  Internal: update asset balance                                        */
  /* ---------------------------------------------------------------------- */

  function adjustAssetBalance(code: CurrencyCode, delta: number) {
    setState((prev) => ({
      ...prev,
      assets: prev.assets.map((a) => {
        if (a.code !== code) return a;
        const newBalance = a.balance + delta;
        const newUsdValue =
          code === "USD" ? newBalance : convertCurrency(newBalance, code, "USD");
        return { ...a, balance: newBalance, usdValue: newUsdValue };
      }),
    }));
  }

  function addTransaction(tx: Transaction) {
    setState((prev) => ({
      ...prev,
      transactions: [tx, ...prev.transactions],
    }));
  }

  function pushNotification(n: Omit<AppNotification, "id" | "date" | "read">) {
    setState((prev) => ({
      ...prev,
      notifications: [
        {
          id: generateId("ntf"),
          date: new Date().toISOString(),
          read: false,
          ...n,
        },
        ...prev.notifications,
      ],
    }));
  }

  /* ---------------------------------------------------------------------- */
  /*  Actions — financial                                                   */
  /* ---------------------------------------------------------------------- */

  const sendCrypto = React.useCallback(
    async (input: SendCryptoInput): Promise<Transaction> => {
      await delay(1200);
      const asset = state.assets.find((a) => a.code === input.assetCode);
      if (!asset) throw new Error("Asset not found");
      if (input.amount > asset.balance) throw new Error("Insufficient balance");

      const fee = 1.2;
      const tx = buildTransaction({
        type: "sent",
        direction: "out",
        title: `Sent ${input.assetCode}`,
        subtitle: `To ${input.recipientAddress.slice(0, 8)}...${input.recipientAddress.slice(-4)} · ${input.network}`,
        amount: input.amount,
        currency: input.assetCode,
        usdValue: convertCurrency(input.amount, input.assetCode, "USD"),
        counterparty: {
          name: "External wallet",
          detail: input.recipientAddress,
          avatarColor: "bg-slate-500",
        },
        network: input.network,
        fee,
        feeCurrency: input.assetCode,
        assetCode: input.assetCode,
        note: input.note,
      });

      adjustAssetBalance(input.assetCode, -(input.amount + fee));
      addTransaction(tx);
      pushNotification({
        type: "transaction",
        title: `${input.amount} ${input.assetCode} sent`,
        message: `Transfer to ${input.recipientAddress.slice(0, 8)}...${input.recipientAddress.slice(-4)} completed.`,
      });
      return tx;
    },
    [state.assets],
  );

  const sendMoney = React.useCallback(
    async (input: SendMoneyInput): Promise<Transaction> => {
      await delay(1200);
      const asset = state.assets.find((a) => a.code === input.fromCurrency);
      if (!asset) throw new Error("Account not found");
      const fee = 2.5;
      const total = input.amount + fee;
      if (total > asset.balance) throw new Error("Insufficient balance");

      const rate = USD_RATES[input.recipient.currency] ?? 1;
      const receiveAmount = input.amount * rate;
      const tx = buildTransaction({
        type: "sent",
        direction: "out",
        title: "Sent money",
        subtitle: `To ${input.recipient.name} · ${input.recipient.country}`,
        amount: input.amount,
        currency: input.fromCurrency,
        usdValue: convertCurrency(input.amount, input.fromCurrency, "USD"),
        counterparty: {
          name: input.recipient.name,
          detail: input.recipient.accountNumber ?? input.recipient.walletAddress,
          avatarColor: input.recipient.avatarColor ?? "bg-teal-500",
        },
        fee,
        feeCurrency: input.fromCurrency,
        assetCode: input.fromCurrency,
        note: input.note,
      });

      adjustAssetBalance(input.fromCurrency, -total);
      addTransaction(tx);
      pushNotification({
        type: "transaction",
        title: `Money sent to ${input.recipient.name}`,
        message: `${input.recipient.currency === "NGN" ? "₦" : ""}${receiveAmount.toLocaleString()} will arrive shortly.`,
      });
      return tx;
    },
    [state.assets],
  );

  const depositCrypto = React.useCallback(
    async (input: DepositCryptoInput): Promise<Transaction> => {
      await delay(1200);
      const tx = buildTransaction({
        type: "deposit",
        direction: "in",
        title: "Crypto deposit",
        subtitle: `${input.assetCode} · ${input.network}`,
        amount: input.amount,
        currency: input.assetCode,
        usdValue: convertCurrency(input.amount, input.assetCode, "USD"),
        network: input.network,
        assetCode: input.assetCode,
      });

      adjustAssetBalance(input.assetCode, input.amount);
      addTransaction(tx);
      pushNotification({
        type: "transaction",
        title: `${input.amount} ${input.assetCode} received`,
        message: `Your deposit via ${input.network} has been confirmed.`,
      });
      return tx;
    },
    [],
  );

  const withdraw = React.useCallback(
    async (input: WithdrawInput): Promise<Transaction> => {
      await delay(1200);
      const asset = state.assets.find((a) => a.code === input.fromCurrency);
      if (!asset) throw new Error("Account not found");
      const fee = input.method === "bank" ? 2.5 : 1.5;
      if (input.amount + fee > asset.balance) throw new Error("Insufficient balance");

      const tx = buildTransaction({
        type: "withdrawal",
        direction: "out",
        title: "Withdrawal",
        subtitle: `To ${input.recipient.name} · ${input.method}`,
        amount: input.amount,
        currency: input.fromCurrency,
        usdValue: convertCurrency(input.amount, input.fromCurrency, "USD"),
        counterparty: {
          name: input.recipient.name,
          detail: input.recipient.accountNumber ?? input.recipient.walletAddress,
          avatarColor: input.recipient.avatarColor ?? "bg-amber-500",
        },
        fee,
        feeCurrency: input.fromCurrency,
        assetCode: input.fromCurrency,
      });

      adjustAssetBalance(input.fromCurrency, -(input.amount + fee));
      addTransaction(tx);
      pushNotification({
        type: "transaction",
        title: "Withdrawal processed",
        message: `${input.method === "bank" ? "Bank" : "Mobile money"} withdrawal to ${input.recipient.name} is on its way.`,
      });
      return tx;
    },
    [state.assets],
  );

  const exchange = React.useCallback(
    async (input: ExchangeInput): Promise<Transaction> => {
      await delay(1200);
      const fromAsset = state.assets.find((a) => a.code === input.from);
      if (!fromAsset) throw new Error("Source account not found");
      if (input.amount > fromAsset.balance) throw new Error("Insufficient balance");

      const rate = (USD_RATES[input.to] ?? 1) / (USD_RATES[input.from] ?? 1);
      const toAmount = input.amount * rate;

      const tx = buildTransaction({
        type: "exchange",
        direction: "neutral",
        title: "Currency exchange",
        subtitle: `${input.from} → ${input.to}`,
        amount: toAmount,
        currency: input.to,
        usdValue: convertCurrency(toAmount, input.to, "USD"),
        exchangeRate: rate,
        fromCurrency: input.from,
        toCurrency: input.to,
        fromAmount: input.amount,
        toAmount,
        assetCode: input.from,
      });

      adjustAssetBalance(input.from, -input.amount);
      adjustAssetBalance(input.to, toAmount);
      addTransaction(tx);
      pushNotification({
        type: "transaction",
        title: "Exchange complete",
        message: `${input.amount} ${input.from} → ${toAmount.toLocaleString()} ${input.to}.`,
      });
      return tx;
    },
    [state.assets],
  );

  /* ---------------------------------------------------------------------- */
  /*  Actions — cards                                                       */
  /* ---------------------------------------------------------------------- */

  const freezeCard = React.useCallback(async (id: string): Promise<void> => {
    await delay(800);
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === id ? { ...c, status: "frozen" } : c,
      ),
    }));
    pushNotification({
      type: "card",
      title: "Card frozen",
      message: "Your virtual card has been frozen. Unfreeze it anytime.",
    });
  }, []);

  const unfreezeCard = React.useCallback(async (id: string): Promise<void> => {
    await delay(800);
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === id ? { ...c, status: "active" } : c,
      ),
    }));
    pushNotification({
      type: "card",
      title: "Card unfrozen",
      message: "Your virtual card is active again.",
    });
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  Actions — recipients                                                  */
  /* ---------------------------------------------------------------------- */

  const addRecipient = React.useCallback((recipient: Omit<Recipient, "id">) => {
    const newRecipient: Recipient = {
      ...recipient,
      id: generateId("rcp"),
    };
    setState((prev) => ({
      ...prev,
      recipients: [newRecipient, ...prev.recipients],
    }));
    return newRecipient;
  }, []);

  const removeRecipient = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r.id !== id),
    }));
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  Actions — notifications                                               */
  /* ---------------------------------------------------------------------- */

  const markNotificationRead = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    }));
  }, []);

  const markAllNotificationsRead = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  Actions — user / settings                                             */
  /* ---------------------------------------------------------------------- */

  const updateUser = React.useCallback((patch: Partial<UserProfile>) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, ...patch },
    }));
  }, []);

  const updatePreferences = React.useCallback(
    (patch: Partial<UserProfile["preferences"]>) => {
      setState((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          preferences: { ...prev.user.preferences, ...patch },
        },
      }));
    },
    [],
  );

  const updateNotificationPreferences = React.useCallback(
    (patch: Partial<UserProfile["preferences"]["notifications"]>) => {
      setState((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          preferences: {
            ...prev.user.preferences,
            notifications: {
              ...prev.user.preferences.notifications,
              ...patch,
            },
          },
        },
      }));
    },
    [],
  );

  const submitKyc = React.useCallback(async (docs: KycDocument[]): Promise<void> => {
    await delay(1500);
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        kycStatus: "under_review" as KycStatus,
        kycDocuments: docs,
      },
    }));
    pushNotification({
      type: "verification",
      title: "Verification submitted",
      message: "We're reviewing your information. This usually takes a few minutes.",
    });
  }, []);

  const simulateKycComplete = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        kycStatus: "verified" as KycStatus,
        verified: true,
      },
    }));
    pushNotification({
      type: "verification",
      title: "Verification complete",
      message: "Your identity has been verified successfully.",
    });
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  Reset                                                                 */
  /* ---------------------------------------------------------------------- */

  const resetToDefaults = React.useCallback(() => {
    saveState(STORAGE_KEYS.dataVersion, DATA_VERSION);
    setState({
      assets: INITIAL_ASSETS,
      transactions: INITIAL_TRANSACTIONS,
      cards: INITIAL_CARDS,
      recipients: INITIAL_RECIPIENTS,
      notifications: INITIAL_NOTIFICATIONS,
      user: DEMO_USER,
      hydrated: true,
    });
  }, []);

  /* ---------------------------------------------------------------------- */
  /*  Context value                                                        */
  /* ---------------------------------------------------------------------- */

  const value: AppStoreContext = {
    ...state,
    totalUsdBalance,
    getAsset,
    getTransactionsForAsset,
    getTransaction,
    unreadNotificationCount,
    sendCrypto,
    sendMoney,
    depositCrypto,
    withdraw,
    exchange,
    freezeCard,
    unfreezeCard,
    addRecipient,
    removeRecipient,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification: pushNotification,
    updateUser,
    updatePreferences,
    updateNotificationPreferences,
    submitKyc,
    simulateKycComplete,
    resetToDefaults,
  };

  return (
    <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
  );
}

export function useAppStore(): AppStoreContext {
  const ctx = React.useContext(AppStoreContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within <AppStoreProvider>");
  }
  return ctx;
}
