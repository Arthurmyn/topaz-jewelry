import Link from "next/link";
import { ru } from "@/content/ru";
import type { ProductListItem } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "./product-image";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="bg-sand overflow-hidden">
        <div className="transition-transform duration-500 group-hover:scale-105">
          <ProductImage
            image={product.image}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </div>
      </div>
      <h3 className="mt-3 text-sm leading-snug">{product.name}</h3>
      <p className="mt-1 text-sm font-medium">{formatPrice(product.price_from_minor)}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        <Badge>
          {ru.catalog.metals[product.metal] ?? product.metal} {product.purity}
        </Badge>
        {!product.in_stock && <Badge>{ru.product.outOfStock}</Badge>}
      </div>
    </Link>
  );
}
