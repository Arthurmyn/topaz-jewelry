import { cache } from "react";
import { serverApi } from "@/lib/api/client";
import type { PublicConfig } from "@/lib/api/types";

const FALLBACK: PublicConfig = {
  features: { accounts: false, payments: false },
  currency: "KZT",
  whatsapp_number: "",
};

/**
 * Public config incl. feature flags. Fetched at runtime (not baked into the build),
 * so changing FEATURE_* env vars needs a restart, not a rebuild.
 */
export const getConfig = cache(async (): Promise<PublicConfig> => {
  try {
    const { data } = await serverApi(60).GET("/api/v1/config");
    return data ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
});
