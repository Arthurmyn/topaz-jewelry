/** Locale and currency constants shared by server and client code. */

export const LOCALES = ["ru", "kk", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_COOKIE = "topaz_lang";

export const CURRENCIES = ["KZT", "USD", "RUB"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = "KZT";
export const CURRENCY_COOKIE = "topaz_cur";

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function isCurrency(value: string | undefined): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

/** BCP 47 tag used for number formatting. */
export const INTL_TAG: Record<Locale, string> = { ru: "ru-RU", kk: "kk-KZ", en: "en-US" };
