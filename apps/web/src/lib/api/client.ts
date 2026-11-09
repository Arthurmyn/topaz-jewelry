import createClient from "openapi-fetch";
import type { paths } from "./schema";

/**
 * Typed API client for server components. Calls the API service directly (no proxy hop).
 * - Vercel: `API_URL` is injected by the service binding declared in vercel.json.
 * - Docker Compose: `INTERNAL_API_URL` points at the `api` container.
 */
const baseUrl = (process.env.API_URL ?? process.env.INTERNAL_API_URL ?? "http://api:8000").replace(
  /\/$/,
  "",
);

export function serverApi(revalidate: number | false = 300) {
  return createClient<paths>({
    baseUrl,
    fetch: (req) =>
      fetch(req, revalidate === false ? { cache: "no-store" } : { next: { revalidate } }),
  });
}
