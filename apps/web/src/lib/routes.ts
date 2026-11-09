import type { Dictionary } from "@/content/dictionaries";

export type HeaderNavKey = keyof Dictionary["header"]["nav"];

/** Header navigation. Labels come from the dictionary; hrefs are language-independent. */
export const HEADER_NAV: { key: HeaderNavKey; href: string }[] = [
  { key: "jewelry", href: "/catalog" },
  { key: "collections", href: "/catalog?sort=new" },
  { key: "stones", href: "/catalog?stone=diamond" },
  { key: "wedding", href: "/catalog/rings?type=wedding" },
  { key: "gifts", href: "/catalog?priceMax=100000" },
  { key: "stores", href: "/stores" },
  { key: "brand", href: "/about" },
];

export const INFO_NAV_ORDER = [
  "delivery",
  "sizes",
  "care",
  "returns",
  "faq",
  "offer",
  "privacy",
] as const;
export type InfoNavKey = (typeof INFO_NAV_ORDER)[number];
export type InfoSlug = keyof Dictionary["info"]["pages"];

export function isInfoSlug(value: string, pages: Dictionary["info"]["pages"]): value is InfoSlug {
  return Object.prototype.hasOwnProperty.call(pages, value);
}
