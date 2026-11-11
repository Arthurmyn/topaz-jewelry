import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS } from "@/content/mock/products";
import { INFO_NAV_ORDER } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = (process.env.SITE_URL ?? "http://localhost:8080").replace(/\/$/, "");
  return [
    { url: site },
    { url: `${site}/catalog` },
    { url: `${site}/stores` },
    { url: `${site}/about` },
    { url: `${site}/services` },
    { url: `${site}/gift-cards` },
    { url: `${site}/blog` },
    { url: `${site}/stores/astana` },
    { url: `${site}/stores/karaganda` },
    ...INFO_NAV_ORDER.map((slug) => ({ url: `${site}/info/${slug}` })),
    ...CATEGORIES.map((c) => ({ url: `${site}/catalog/${c}` })),
    ...PRODUCTS.map((p) => ({ url: `${site}/product/${p.slug}` })),
  ];
}
