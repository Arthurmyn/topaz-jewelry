import { INTL_TAG, type Locale } from "./locale";

export type PluralForms = {
  other: string;
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
};

/** Build plural forms with the right type (see Dictionary). */
export function pf(forms: PluralForms): PluralForms {
  return forms;
}

/** Replace `{name}` placeholders. Dictionaries hold plain strings so they can cross to client components. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

/** Pick the plural form for a number in the given locale, then fill `{n}`. */
export function plural(forms: PluralForms, n: number, locale: Locale): string {
  const category = new Intl.PluralRules(INTL_TAG[locale]).select(n);
  return fmt(forms[category] ?? forms.other, { n });
}
