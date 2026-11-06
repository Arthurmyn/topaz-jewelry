import type { MetadataRoute } from "next";
import { ru } from "@/content/ru";
import { serverApi } from "@/lib/api/client";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.SITE_URL ?? "http://localhost:8080").replace(/\/$/, "");
  const api = serverApi(3600);
  const [{ data: categories }, { data: products }] = await Promise.all([
    api.GET("/api/v1/categories"),
    api.GET("/api/v1/products", { params: { query: { page_size: 100 } } }),
  ]);
  const flat = (categories ?? []).flatMap((c) => [c, ...c.children]);
  return [
    { url: site },
    { url: `${site}/catalog` },
    { url: `${site}/stores` },
    ...Object.keys(ru.pages).map((p) => ({ url: `${site}/${p}` })),
    ...flat.map((c) => ({ url: `${site}/catalog/${c.slug}` })),
    ...(products?.items ?? []).map((p) => ({ url: `${site}/product/${p.slug}` })),
  ];
}
