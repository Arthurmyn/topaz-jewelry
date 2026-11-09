"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/content/dictionaries";
import { formatMoney, type Rates } from "@/lib/currency";
import type { Features } from "@/lib/features";
import { CURRENCY_COOKIE, LOCALE_COOKIE, type Currency, type Locale } from "@/lib/locale";

type AppContextValue = {
  locale: Locale;
  dict: Dictionary;
  currency: Currency;
  rates: Rates;
  features: Features;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProviders({
  value,
  children,
}: {
  value: AppContextValue;
  children: React.ReactNode;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProviders>");
  return ctx;
}

export const useDict = () => useApp().dict;
export const useLocale = () => useApp().locale;
export const useFeatures = () => useApp().features;
export const useCurrency = () => {
  const { currency, rates } = useApp();
  return { currency, rates };
};

/** Returns a formatter: KZT amount -> string in the selected currency and locale. */
export function useMoney(): (amountKzt: number) => string {
  const { currency, rates, locale } = useApp();
  return useCallback(
    (amountKzt: number) => formatMoney(amountKzt, currency, rates, locale),
    [currency, rates, locale],
  );
}

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Persist a preference in a cookie and re-render server components with it. */
export function usePreferences() {
  const router = useRouter();
  return useMemo(() => {
    const save = (name: string, value: string) => {
      document.cookie = `${name}=${value}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      router.refresh();
    };
    return {
      setLocale: (locale: Locale) => save(LOCALE_COOKIE, locale),
      setCurrency: (currency: Currency) => save(CURRENCY_COOKIE, currency),
    };
  }, [router]);
}
