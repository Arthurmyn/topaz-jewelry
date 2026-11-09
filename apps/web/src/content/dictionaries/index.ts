import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";
import { ru, type Dictionary } from "./ru";
import { en } from "./en";
import { kk } from "./kk";

export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { ru, kk, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}
