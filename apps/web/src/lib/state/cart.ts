"use client";

import { createLocalStore } from "./local-store";

export type Purity = 585 | 750;

export type CartLine = {
  productId: string;
  purity: Purity;
  /** Ring size or length; null for items without sizes. */
  size: number | null;
  qty: number;
};

const store = createLocalStore<CartLine[]>("topaz_cart", []);

const same = (a: CartLine, b: Pick<CartLine, "productId" | "purity" | "size">) =>
  a.productId === b.productId && a.purity === b.purity && a.size === b.size;

export const useCartLines = store.useStore;

export function addToCart(line: Omit<CartLine, "qty">, qty = 1) {
  const lines = store.get();
  const existing = lines.find((l) => same(l, line));
  store.set(
    existing
      ? lines.map((l) => (l === existing ? { ...l, qty: Math.min(l.qty + qty, 99) } : l))
      : [...lines, { ...line, qty }],
  );
}

export function setLineQty(line: CartLine, qty: number) {
  const next = Math.max(0, Math.min(qty, 99));
  store.set(
    store.get().flatMap((l) => (same(l, line) ? (next === 0 ? [] : [{ ...l, qty: next }]) : [l])),
  );
}

export function removeLine(line: CartLine) {
  store.set(store.get().filter((l) => !same(l, line)));
}

export function clearCart() {
  store.set([]);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}
