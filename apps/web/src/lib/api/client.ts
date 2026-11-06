import createClient from "openapi-fetch";
import type { paths } from "./schema";

/** Typed API client for server components. Calls the API container directly (no proxy hop). */
const baseUrl = process.env.INTERNAL_API_URL ?? "http://api:8000";

export function serverApi(revalidate: number | false = 300) {
  return createClient<paths>({
    baseUrl,
    fetch: (req) =>
      fetch(req, revalidate === false ? { cache: "no-store" } : { next: { revalidate } }),
  });
}
