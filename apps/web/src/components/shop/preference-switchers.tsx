"use client";

import { Dropdown } from "@/components/ui/dropdown";
import {
  useCurrency,
  useDict,
  useLocale,
  usePreferences,
} from "@/components/providers/app-providers";
import { CURRENCIES, LOCALES } from "@/lib/locale";

/** Language and currency selectors (placed in the top-left of the header). */
export function PreferenceSwitchers() {
  const dict = useDict();
  const locale = useLocale();
  const { currency } = useCurrency();
  const { setLocale, setCurrency } = usePreferences();
  const trigger = "text-13 text-ink transition-colors duration-150 hover:text-muted";

  return (
    <div className="flex items-center gap-4">
      <Dropdown
        label={dict.header.language}
        value={locale}
        onChange={setLocale}
        options={LOCALES.map((l) => ({ value: l, label: dict.localeNames[l] }))}
        trigger={dict.localeShort[locale]}
        triggerClassName={trigger}
      />
      <Dropdown
        label={dict.header.currency}
        value={currency}
        onChange={setCurrency}
        options={CURRENCIES.map((c) => ({
          value: c,
          label: `${dict.currencyShort[c]}  ${dict.currencyNames[c]}`,
        }))}
        trigger={dict.currencyShort[currency]}
        triggerClassName={trigger}
      />
    </div>
  );
}
