import { describe, expect, it } from "vitest";
import { getDictionary } from ".";

/** Flatten an object into "a.b.0.c" paths so shapes can be compared. */
function paths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
    paths(v, prefix ? `${prefix}.${k}` : k),
  );
}

// Plural forms (few, many ...) legitimately differ between languages.
const withoutPlurals = (list: string[]) => list.filter((p) => !p.includes(".count."));

const ru = getDictionary("ru");

describe("dictionaries", () => {
  for (const locale of ["en", "kk"] as const) {
    it(`${locale} has exactly the same keys as ru`, () => {
      expect(withoutPlurals(paths(getDictionary(locale))).sort()).toEqual(
        withoutPlurals(paths(ru)).sort(),
      );
    });

    it(`${locale} keeps the same placeholders as ru in every string`, () => {
      const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      const flat = (d: unknown) => {
        const out: Record<string, string> = {};
        const walk = (v: unknown, p: string) => {
          if (typeof v === "string") out[p] = v;
          else if (v && typeof v === "object")
            Object.entries(v).forEach(([k, x]) => walk(x, p ? `${p}.${k}` : k));
        };
        walk(d, "");
        return out;
      };
      const base = flat(ru);
      const other = flat(getDictionary(locale));
      for (const key of Object.keys(base)) {
        // Plural forms may legitimately differ between languages; every other string must match.
        if (key.includes("count.")) continue;
        expect(placeholders(other[key] ?? ""), key).toEqual(placeholders(base[key] ?? ""));
      }
    });
  }
});
