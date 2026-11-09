import "server-only";
import { cache } from "react";
import { parseNbkRates, type Rates } from "./currency";

/**
 * Exchange rates from the National Bank of Kazakhstan public RSS (no API key):
 *   https://nationalbank.kz/rss/get_rates.cfm?fdate=DD.MM.YYYY
 * Each <item> has <title>CODE</title>, <description>KZT for <quant> units</description>.
 * Server-side only: the feed is not meant for browsers.
 */
// Used only when the National Bank cannot be reached. Values from the NBK feed of 2026-11-10.
const FALLBACK: Rates = { USD: 448.98, RUB: 5.45, asOf: "2026-11-10", source: "fallback" };

const NBK_URL = "https://nationalbank.kz/rss/get_rates.cfm";
const REVALIDATE_SECONDS = 60 * 60;
const LOOKBACK_DAYS = 4; // the feed is empty before the day's rates are published

function ddmmyyyy(date: Date): string {
  const parts = new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Asia/Almaty",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}.${get("month")}.${get("year")}`;
}

/** Cached for an hour by Next. Falls back to the last known rates if the feed is unreachable. */
export const getRates = cache(async (): Promise<Rates> => {
  for (let back = 0; back < LOOKBACK_DAYS; back++) {
    const day = new Date(Date.now() - back * 86_400_000);
    const stamp = ddmmyyyy(day);
    try {
      const res = await fetch(`${NBK_URL}?fdate=${stamp}`, {
        next: { revalidate: REVALIDATE_SECONDS },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const parsed = parseNbkRates(await res.text());
      if (parsed) return { ...parsed, asOf: stamp, source: "nbk" };
    } catch (error) {
      console.warn(`[currency] NBK rates for ${stamp} failed:`, error);
      break; // network problem: do not hammer the feed, use the fallback
    }
  }
  return FALLBACK;
});
