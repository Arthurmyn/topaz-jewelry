import type { Dictionary } from "@/content/dictionaries";
import type { Category, Product, RingType } from "@/content/mock/products";
import type { Purity } from "@/lib/state/cart";

type TypeKey = keyof Dictionary["itemTypes"];

export function productTypeKey(product: Product): TypeKey {
  if (product.category === "rings") return (product.ringType ?? "ring") as RingType;
  return product.category;
}

/** "Кольцо Aurora": type word from the dictionary + collection name. */
export function productTitle(product: Product, dict: Dictionary): string {
  return `${dict.itemTypes[productTypeKey(product)]} ${product.collection}`;
}

/** "Золото 585, бриллиант" (stone omitted when there is none). */
export function productSubtitle(product: Product, purity: Purity, dict: Dictionary): string {
  const metal = dict.metals[String(purity) as "585" | "750"];
  const stone = dict.stonesInline[product.stone];
  return stone ? `${metal}, ${stone}` : metal;
}

export function categoryTitle(category: Category, dict: Dictionary): string {
  return dict.categories[category];
}

/** Price shown on cards and lists: the lowest available purity option. */
export function startingPrice(product: Product): number {
  return Math.min(...product.purities.map((p) => product.prices[p]));
}

/** The purity whose price is `startingPrice`. */
export function startingPurity(product: Product): Purity {
  return product.purities.reduce((best, p) =>
    product.prices[p] < product.prices[best] ? p : best,
  );
}

export function productHref(product: Product): string {
  return `/product/${product.slug}`;
}

export function isCategory(value: string): value is Category {
  return ["rings", "earrings", "necklaces", "bracelets", "pendants"].includes(value);
}
