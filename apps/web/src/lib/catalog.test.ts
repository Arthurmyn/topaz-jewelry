import { describe, expect, it } from "vitest";
import { getDictionary } from "@/content/dictionaries";
import { PRODUCTS } from "@/content/mock/products";
import {
  EMPTY_FILTERS,
  availableSizes,
  filterProducts,
  parseFilters,
  serializeFilters,
} from "./catalog";
import { startingPrice } from "./products";

const dict = getDictionary("ru");
const run = (query: string, category: Parameters<typeof filterProducts>[2] = null) =>
  filterProducts(PRODUCTS, parseFilters(new URLSearchParams(query)), category, dict);

describe("catalog filters", () => {
  it("round-trips through the query string", () => {
    const query =
      "type=wedding&metal=585&stone=diamond&priceMin=100000&priceMax=300000&size=17&stock=in&sort=priceAsc";
    const filters = parseFilters(new URLSearchParams(query));
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });

  it("ignores unknown values instead of failing", () => {
    const filters = parseFilters(
      new URLSearchParams("type=nope&metal=999&sort=weird&priceMin=abc"),
    );
    expect(filters).toEqual(EMPTY_FILTERS);
  });

  it("filters by category and ring type", () => {
    expect(run("", "earrings").every((p) => p.category === "earrings")).toBe(true);
    const wedding = run("type=wedding", "rings");
    expect(wedding.length).toBeGreaterThan(0);
    expect(wedding.every((p) => p.ringType === "wedding")).toBe(true);
  });

  it("filters by purity, stone, price and availability", () => {
    expect(run("metal=750").every((p) => p.purities.includes(750))).toBe(true);
    expect(run("stone=sapphire").every((p) => p.stone === "sapphire")).toBe(true);
    const priced = run("priceMin=100000&priceMax=200000");
    expect(priced.every((p) => startingPrice(p) >= 100000 && startingPrice(p) <= 200000)).toBe(
      true,
    );
    expect(run("stock=order").every((p) => p.availability === "on_order")).toBe(true);
  });

  it("filters by size", () => {
    const sized = run("size=21", "rings");
    expect(sized.length).toBeGreaterThan(0);
    expect(sized.every((p) => p.sizes?.includes(21))).toBe(true);
  });

  it("sorts by price both ways", () => {
    const asc = run("sort=priceAsc").map(startingPrice);
    const desc = run("sort=priceDesc").map(startingPrice);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it("combines filters (AND) and can return nothing", () => {
    expect(run("stone=emerald&metal=750&priceMax=1000").length).toBe(0);
  });

  it("lists available sizes ascending", () => {
    const sizes = availableSizes(PRODUCTS.filter((p) => p.category === "rings"));
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(sizes[0]).toBe(15);
  });
});

describe("mock catalog integrity", () => {
  it("has unique ids and slugs and at least one purity per product", () => {
    expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(PRODUCTS.length);
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(PRODUCTS.length);
    expect(PRODUCTS.every((p) => p.purities.length > 0)).toBe(true);
  });
});
