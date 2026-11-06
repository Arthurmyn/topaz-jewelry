"use client";

/** Browser-side fetch helper for the admin area: same-origin cookies + CSRF header. */

export class AdminApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}

let csrfToken: string | null = null;

async function csrf(): Promise<string> {
  if (!csrfToken) {
    const res = await fetch("/api/v1/auth/csrf", { credentials: "same-origin" });
    csrfToken = ((await res.json()) as { csrf_token: string }).csrf_token;
  }
  return csrfToken;
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body) headers.set("Content-Type", "application/json");
  if (method !== "GET") headers.set("X-CSRF-Token", await csrf());

  const res = await fetch(`/api/v1${path}`, { ...init, headers, credentials: "same-origin" });
  if (!res.ok) {
    if (res.status === 403) csrfToken = null; // refresh token on next call
    const body = (await res.json().catch(() => ({}))) as { code?: string };
    throw new AdminApiError(res.status, body.code ?? "generic");
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
