import type { Currency, Locale } from "./locale";

/** Exchange rates: KZT per ONE unit of the foreign currency (see lib/rates.ts for the source). */
export type Rates = { USD: number; RUB: number; asOf: string; source: "nbk" | "fallback" };

/** Convert a KZT amount into the selected currency (whole units for USD and RUB). */
/** Pure parser, exported for tests. Returns null when a required currency is missing. */
export function parseNbkRates(xml: string): { USD: number; RUB: number } | null {
  const rateFor = (code: string): number | null => {
    const match = new RegExp(
      `<title>${code}</title>\\s*<description>([\\d.,]+)</description>\\s*<quant>(\\d+)</quant>`,
    ).exec(xml);
    if (!match) return null;
    const value = Number((match[1] ?? "").replace(",", "."));
    const quant = Number(match[2]);
    return Number.isFinite(value) && quant > 0 ? value / quant : null;
  };
  const USD = rateFor("USD");
  const RUB = rateFor("RUB");
  return USD && RUB ? { USD, RUB } : null;
}

export function convertKzt(amountKzt: number, currency: Currency, rates: Rates): number {
  if (currency === "KZT") return Math.round(amountKzt);
  return Math.round(amountKzt / rates[currency]);
}

const SYMBOL: Record<Currency, string> = { KZT: "₸", USD: "$", RUB: "₽" };

/** Digit grouping without Intl: server and browser ICU data can differ (notably for Kazakh) and break hydration. */
function group(n: number, separator: string): string {
  return String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * "185 000 ₸" for Russian and Kazakh (symbol after, no-break spaces), "₸185,000" for English
 * (symbol before, commas). Deterministic on server and client.
 */
export function formatMoney(
  amountKzt: number,
  currency: Currency,
  rates: Rates,
  locale: Locale,
): string {
  const amount = convertKzt(amountKzt, currency, rates);
  const symbol = SYMBOL[currency];
  return locale === "en"
    ? `${symbol}${group(amount, ",")}`
    : `${group(amount, "\u00a0")}\u00a0${symbol}`;
}

/** Convert a value typed by the user in the selected currency back to KZT (for price filters). */
export function toKzt(amount: number, currency: Currency, rates: Rates): number {
  return currency === "KZT" ? amount : amount * rates[currency];
}
