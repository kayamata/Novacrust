"use client";

import * as React from "react";
import type { UserProfile } from "@/shared/types";
import { DEMO_USER } from "@/shared/data";
import { STORAGE_KEYS, DEMO_CREDENTIALS } from "@/utils/constants";

/* -------------------------------------------------------------------------- */
/*  Auth state — frontend-only, persisted to localStorage.                     */
/* -------------------------------------------------------------------------- */

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

interface AuthContext extends AuthState {
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    country: string;
  }) => Promise<UserProfile>;
  signOut: () => void;
  completeOnboarding: () => void;
}

const AuthContext = React.createContext<AuthContext | null>(null);

function loadUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.auth);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function saveUser(user: UserProfile | null): void {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.auth);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    hydrated: false,
  });

  // Hydrate from localStorage on mount (SSR-safe: localStorage is only
  // available in the browser, so this must run in an effect, not lazily).
  React.useEffect(() => {
    const user = loadUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({
      user,
      isAuthenticated: !!user,
      hydrated: true,
    });
  }, []);

  const signIn = React.useCallback(
    async (email: string, password: string): Promise<UserProfile> => {
      await delay(1000);
      if (
        email.trim().toLowerCase() !== DEMO_CREDENTIALS.email ||
        password !== DEMO_CREDENTIALS.password
      ) {
        throw new Error("Incorrect email or password.");
      }
      const user = { ...DEMO_USER };
      saveUser(user);
      setState({ user, isAuthenticated: true, hydrated: true });
      return user;
    },
    [],
  );

  const signUp = React.useCallback(
    async (input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      country: string;
    }): Promise<UserProfile> => {
      await delay(1200);
      const user: UserProfile = {
        ...DEMO_USER,
        id: `user_${Date.now()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        country: input.country,
        verified: false,
        kycStatus: "unverified",
        kycDocuments: [],
        createdAt: new Date().toISOString(),
      };
      saveUser(user);
      setState({ user, isAuthenticated: true, hydrated: true });
      return user;
    },
    [],
  );

  const signOut = React.useCallback(() => {
    saveUser(null);
    setState({ user: null, isAuthenticated: false, hydrated: true });
  }, []);

  const completeOnboarding = React.useCallback(() => {
    // Onboarding completion is tracked in localStorage separately.
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.onboardingComplete, "true");
    }
  }, []);

  const value: AuthContext = {
    ...state,
    signIn,
    signUp,
    signOut,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContext {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
