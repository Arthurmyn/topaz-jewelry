/**
 * Optional modules, switched by environment variables read at runtime on the server
 * (so a restart is enough, no rebuild). Defaults to off, matching the product rules.
 *   FEATURE_ACCOUNTS=true  -> profile, favorites sync, login
 *   FEATURE_PAYMENTS=true  -> online card payment option at checkout
 */
export type Features = { accounts: boolean; payments: boolean };

export function getFeatures(): Features {
  return {
    accounts: process.env.FEATURE_ACCOUNTS === "true",
    payments: process.env.FEATURE_PAYMENTS === "true",
  };
}
