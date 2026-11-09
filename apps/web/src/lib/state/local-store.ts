"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store for the frontend-only build.
 * Server snapshot is always `initial`, so hydration never mismatches.
 */
export function createLocalStore<T>(key: string, initial: T) {
  let cache: T = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) cache = JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[local-store] could not read "${key}", using defaults:`, error);
    }
  }

  function emit() {
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      loaded = false; // another tab changed it: re-read
      emit();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function getSnapshot(): T {
    load();
    return cache;
  }

  function set(next: T) {
    cache = next;
    loaded = true;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch (error) {
      console.warn(`[local-store] could not save "${key}":`, error);
    }
    emit();
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, getSnapshot, () => initial);
  }

  return { useStore, set, get: getSnapshot };
}
