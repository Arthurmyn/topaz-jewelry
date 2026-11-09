/**
 * MOCK catalog for the frontend-only build. Prices are in KZT; the UI converts to the
 * selected currency. Names are "type word + collection name": the type word comes from the
 * dictionary, so no per-language product copy is needed. Replace with the API later.
 */
import type { Purity } from "@/lib/state/cart";

export type Category = "rings" | "earrings" | "necklaces" | "bracelets" | "pendants";
export type RingType = "ring" | "wedding" | "engagement" | "signet";
export type Stone = "diamond" | "topaz" | "sapphire" | "emerald" | "none";
export type StoreId = "astana" | "karaganda";

export type Product = {
  id: string;
  slug: string;
  category: Category;
  /** Only for rings; used by the "Категория" filter and the wedding shortcuts. */
  ringType: RingType | null;
  /** Collection / model name, not translated. */
  collection: string;
  article: string;
  /** Available gold purities (each has its own price). */
  purities: Purity[];
  prices: Record<Purity, number>;
  stone: Stone;
  sizes: number[] | null;
  availability: "in_stock" | "on_order";
  stores: StoreId[];
  isNew: boolean;
  popularity: number;
};

const RING_SIZES = [15, 16, 17, 18, 19, 20];
const WEDDING_SIZES = [15, 16, 17, 18, 19, 20, 21];
const BRACELET_SIZES = [17, 18, 19];
const NECKLACE_SIZES = [40, 45, 50];

type Row = [
  id: string,
  category: Category,
  ringType: RingType | null,
  collection: string,
  price585: number,
  stone: Stone,
  flags: string, // n = new, o = on order, a = Astana only, k = Karaganda only, x = only 585, y = only 750
];

const ROWS: Row[] = [
  ["r01", "rings", "ring", "Aurora", 185000, "diamond", "n"],
  ["r02", "rings", "ring", "Lumen", 142000, "topaz", ""],
  ["r03", "rings", "ring", "Vesper", 228000, "sapphire", "n"],
  ["r04", "rings", "ring", "Elara", 96000, "none", "x"],
  ["r05", "rings", "ring", "Nova", 310000, "diamond", "o"],
  ["r06", "rings", "wedding", "Classic", 118000, "none", ""],
  ["r07", "rings", "wedding", "Comfort", 134000, "none", "n"],
  ["r08", "rings", "wedding", "Brilliance", 205000, "diamond", ""],
  ["r09", "rings", "wedding", "Eternal", 156000, "none", "a"],
  ["r10", "rings", "engagement", "Solitaire", 420000, "diamond", ""],
  ["r11", "rings", "engagement", "Halo", 368000, "diamond", "n"],
  ["r12", "rings", "engagement", "Royal", 455000, "sapphire", "oy"],
  ["r13", "rings", "engagement", "Stella", 289000, "emerald", ""],
  ["r14", "rings", "signet", "Atlas", 176000, "none", ""],
  ["r15", "rings", "signet", "Crest", 214000, "sapphire", "k"],
  ["r16", "rings", "signet", "Orion", 198000, "none", "n"],
  ["e01", "earrings", null, "Aurora", 124000, "diamond", ""],
  ["e02", "earrings", null, "Lumen", 88000, "topaz", "n"],
  ["e03", "earrings", null, "Vesper", 172000, "sapphire", ""],
  ["e04", "earrings", null, "Elara", 64000, "none", "x"],
  ["n01", "necklaces", null, "Aurora", 248000, "diamond", ""],
  ["n02", "necklaces", null, "Stella", 196000, "emerald", "n"],
  ["n03", "necklaces", null, "Classic", 138000, "none", ""],
  ["b01", "bracelets", null, "Lumen", 112000, "topaz", ""],
  ["b02", "bracelets", null, "Atlas", 164000, "none", "n"],
  ["b03", "bracelets", null, "Nova", 232000, "diamond", "o"],
  ["p01", "pendants", null, "Aurora", 92000, "diamond", ""],
  ["p02", "pendants", null, "Vesper", 108000, "sapphire", "n"],
  ["p03", "pendants", null, "Elara", 54000, "none", "x"],
];

function sizesFor(category: Category, ringType: RingType | null): number[] | null {
  if (category === "rings") return ringType === "wedding" ? WEDDING_SIZES : RING_SIZES;
  if (category === "bracelets") return BRACELET_SIZES;
  if (category === "necklaces") return NECKLACE_SIZES;
  return null;
}

export const PRODUCTS: Product[] = ROWS.map(
  ([id, category, ringType, collection, price585, stone, flags], index) => ({
    id,
    slug: `${category}-${collection.toLowerCase()}-${id}`,
    category,
    ringType,
    collection,
    article: `TZ-${String(1000 + index * 7)}`,
    purities: flags.includes("x") ? [585] : flags.includes("y") ? [750] : [585, 750],
    prices: { 585: price585, 750: Math.round((price585 * 1.3) / 1000) * 1000 },
    stone,
    sizes: sizesFor(category, ringType),
    availability: flags.includes("o") ? "on_order" : "in_stock",
    stores: flags.includes("a")
      ? ["astana"]
      : flags.includes("k")
        ? ["karaganda"]
        : ["astana", "karaganda"],
    isNew: flags.includes("n"),
    popularity: 100 - index * 3,
  }),
);

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function productsByCategory(category: Category): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export const CATEGORIES: Category[] = ["rings", "earrings", "necklaces", "bracelets", "pendants"];
export const RING_TYPES: RingType[] = ["ring", "wedding", "engagement", "signet"];
export const STONES: Stone[] = ["diamond", "topaz", "sapphire", "emerald", "none"];
