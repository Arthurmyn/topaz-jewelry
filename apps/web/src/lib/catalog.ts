import type { Dictionary } from "@/content/dictionaries";
import type { Category, Product, RingType, Stone } from "@/content/mock/products";
import { productTitle, startingPrice } from "@/lib/products";
import type { Purity } from "@/lib/state/cart";

export type SortKey = "popular" | "new" | "priceAsc" | "priceDesc";
export type Stock = "in" | "order";

export type Filters = {
  q: string;
  /** Ring subtypes (used on the rings page). */
  types: RingType[];
  /** Top-level categories (used on the all-jewelry page). */
  cats: Category[];
  metals: Purity[];
  stones: Stone[];
  /** Price bounds in KZT. */
  priceMin: number | null;
  priceMax: number | null;
  sizes: number[];
  stock: Stock[];
  sort: SortKey;
};

export const EMPTY_FILTERS: Filters = {
  q: "",
  types: [],
  cats: [],
  metals: [],
  stones: [],
  priceMin: null,
  priceMax: null,
  sizes: [],
  stock: [],
  sort: "popular",
};

const SORTS: SortKey[] = ["popular", "new", "priceAsc", "priceDesc"];
const TYPES: RingType[] = ["ring", "wedding", "engagement", "signet"];
const CATS: Category[] = ["rings", "earrings", "necklaces", "bracelets", "pendants"];
const STONE_LIST: Stone[] = ["diamond", "topaz", "sapphire", "emerald", "none"];

const pick = <T extends string>(values: string[], allowed: readonly T[]): T[] =>
  values.filter((v): v is T => (allowed as readonly string[]).includes(v));

const num = (value: string | null): number | null => {
  if (value === null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

/** Read filters from a query string (unknown values are ignored). */
export function parseFilters(sp: {
  get(k: string): string | null;
  getAll(k: string): string[];
}): Filters {
  const sort = sp.get("sort");
  return {
    q: sp.get("q")?.trim() ?? "",
    types: pick(sp.getAll("type"), TYPES),
    cats: pick(sp.getAll("cat"), CATS),
    metals: sp
      .getAll("metal")
      .filter((m) => m === "585" || m === "750")
      .map((m) => Number(m) as Purity),
    stones: pick(sp.getAll("stone"), STONE_LIST),
    priceMin: num(sp.get("priceMin")),
    priceMax: num(sp.get("priceMax")),
    sizes: sp
      .getAll("size")
      .map(Number)
      .filter((n) => Number.isFinite(n)),
    stock: pick(sp.getAll("stock"), ["in", "order"] as const),
    sort: (SORTS as string[]).includes(sort ?? "") ? (sort as SortKey) : "popular",
  };
}

export function serializeFilters(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  f.types.forEach((v) => p.append("type", v));
  f.cats.forEach((v) => p.append("cat", v));
  f.metals.forEach((v) => p.append("metal", String(v)));
  f.stones.forEach((v) => p.append("stone", v));
  if (f.priceMin !== null) p.set("priceMin", String(f.priceMin));
  if (f.priceMax !== null) p.set("priceMax", String(f.priceMax));
  f.sizes.forEach((v) => p.append("size", String(v)));
  f.stock.forEach((v) => p.append("stock", v));
  if (f.sort !== "popular") p.set("sort", f.sort);
  return p;
}

export function filterProducts(
  products: Product[],
  f: Filters,
  category: Category | null,
  dict: Dictionary,
): Product[] {
  const q = f.q.toLowerCase();
  const list = products.filter((p) => {
    if (category && p.category !== category) return false;
    if (f.cats.length && !f.cats.includes(p.category)) return false;
    if (f.types.length && !(p.ringType && f.types.includes(p.ringType))) return false;
    if (f.metals.length && !f.metals.some((m) => p.purities.includes(m))) return false;
    if (f.stones.length && !f.stones.includes(p.stone)) return false;
    const price = startingPrice(p);
    if (f.priceMin !== null && price < f.priceMin) return false;
    if (f.priceMax !== null && price > f.priceMax) return false;
    if (f.sizes.length && !(p.sizes && f.sizes.some((s) => p.sizes?.includes(s)))) return false;
    if (f.stock.length) {
      const key: Stock = p.availability === "in_stock" ? "in" : "order";
      if (!f.stock.includes(key)) return false;
    }
    if (q && !`${productTitle(p, dict)} ${p.article}`.toLowerCase().includes(q)) return false;
    return true;
  });
  return sortProducts(list, f.sort);
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  switch (sort) {
    case "new":
      return copy.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.popularity - a.popularity);
    case "priceAsc":
      return copy.sort((a, b) => startingPrice(a) - startingPrice(b));
    case "priceDesc":
      return copy.sort((a, b) => startingPrice(b) - startingPrice(a));
    default:
      return copy.sort((a, b) => b.popularity - a.popularity);
  }
}

/** Sizes available in a set of products, ascending. */
export function availableSizes(products: Product[]): number[] {
  return [...new Set(products.flatMap((p) => p.sizes ?? []))].sort((a, b) => a - b);
}

export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function hasActiveFilters(f: Filters): boolean {
  return (
    f.types.length > 0 ||
    f.cats.length > 0 ||
    f.metals.length > 0 ||
    f.stones.length > 0 ||
    f.sizes.length > 0 ||
    f.stock.length > 0 ||
    f.priceMin !== null ||
    f.priceMax !== null ||
    f.q !== ""
  );
}
