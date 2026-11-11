"use client";

import Link from "next/link";
import type { Product } from "@/content/mock/products";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { useDict, useMoney } from "@/components/providers/app-providers";
import {
  productHref,
  productSubtitle,
  productTitle,
  startingPrice,
  startingPurity,
} from "@/lib/products";

/** Wireframe product card: 282 × 340 photo, name, "metal, stone", price. */
export function ProductCard({ product }: { product: Product }) {
  const dict = useDict();
  const money = useMoney();
  const purity = startingPurity(product);
  return (
    <Link href={productHref(product)} className="press group flex min-w-0 flex-col gap-3">
      <PhotoPlaceholder
        zoom
        label={dict.common.productPhoto}
        className="h-[240px] w-full md:h-[340px]"
      />
      <p className="text-15 text-ink w-full font-medium underline decoration-transparent underline-offset-4 transition-colors duration-150 group-hover:decoration-current">
        {productTitle(product, dict)}
      </p>
      <p className="text-13 text-muted w-full">{productSubtitle(product, purity, dict)}</p>
      <p className="text-15 text-ink w-full font-medium">{money(startingPrice(product))}</p>
    </Link>
  );
}
