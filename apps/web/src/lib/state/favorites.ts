"use client";

import { createLocalStore } from "./local-store";

/** Favorites are local to this browser in the frontend-only build. */
const store = createLocalStore<string[]>("topaz_favorites", []);

export const useFavorites = store.useStore;

export function toggleFavorite(productId: string) {
  const ids = store.get();
  store.set(ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId]);
}
