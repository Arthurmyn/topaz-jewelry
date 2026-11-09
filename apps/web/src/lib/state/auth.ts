"use client";

import { createLocalStore } from "./local-store";

/**
 * MOCK authentication for the frontend-only build: nothing is verified and nothing leaves
 * the browser. Replace with the real API when the backend exists.
 */
export type MockUser = { name: string; phone: string; email: string; newsletter: boolean };

const store = createLocalStore<MockUser | null>("topaz_user", null);

export const useUser = store.useStore;

export function signIn(user: MockUser) {
  store.set(user);
}

export function updateUser(patch: Partial<MockUser>) {
  const current = store.get();
  if (current) store.set({ ...current, ...patch });
}

export function signOut() {
  store.set(null);
}
