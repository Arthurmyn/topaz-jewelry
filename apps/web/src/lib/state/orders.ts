"use client";

import { createLocalStore } from "./local-store";
import type { CartLine } from "./cart";

export type OrderStatus = "placed" | "paid" | "issued";

export type Order = {
  number: string;
  createdAt: string; // ISO date
  status: OrderStatus;
  totalKzt: number;
  lines: CartLine[];
  payment: "online" | "cod" | "request";
  delivery: "pickup" | "delivery";
};

/** Orders created in this browser (frontend-only build). */
const store = createLocalStore<Order[]>("topaz_orders", []);

export const useLocalOrders = store.useStore;

export function nextOrderNumber(mockCount: number): string {
  const n = mockCount + store.get().length + 1;
  return String(n).padStart(6, "0");
}

export function saveOrder(order: Order) {
  store.set([order, ...store.get()]);
}
