import "server-only";
import { cookies } from "next/headers";
import { getDictionary } from "@/content/dictionaries";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isCurrency,
  isLocale,
  type Currency,
  type Locale,
} from "./locale";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getCurrency(): Promise<Currency> {
  const value = (await cookies()).get(CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : DEFAULT_CURRENCY;
}

export async function getDict() {
  return getDictionary(await getLocale());
}
