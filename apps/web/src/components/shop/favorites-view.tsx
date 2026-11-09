"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { useDict } from "@/components/providers/app-providers";
import { getProductById, type Product } from "@/content/mock/products";
import { useFavorites } from "@/lib/state/favorites";
import { ProductCard } from "./product-card";
import { ProductGrid } from "./product-grid";

/** Favorites are stored in this browser, so they work with accounts switched off too. */
export function FavoritesView() {
  const dict = useDict();
  const ids = useFavorites();
  const products = ids.map(getProductById).filter((p): p is Product => Boolean(p));

  return (
    <>
      <Breadcrumbs
        items={[{ label: dict.common.home, href: "/" }, { label: dict.favorites.title }]}
      />
      <div className="px-page py-5">
        <h1 className="text-32 md:text-40 text-ink font-medium">{dict.favorites.title}</h1>
      </div>
      <div className="px-page pt-6 pb-24">
        {products.length === 0 ? (
          <div className="flex flex-col items-start gap-6">
            <p className="text-16 text-muted">{dict.favorites.empty}</p>
            <Button asChild>
              <Link href="/catalog">{dict.favorites.toCatalog}</Link>
            </Button>
          </div>
        ) : (
          <ProductGrid>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        )}
      </div>
    </>
  );
}
