import Link from "next/link";
import { ru } from "@/content/ru";
import type { ProductListItem } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "./product-image";

// Hover motion only where hover exists; touch devices would fire it on tap.
const hoverOnly = "[@media(hover:hover)_and_(pointer:fine)]";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="bg-sand relative overflow-hidden">
        <div
          className={`transition-transform duration-700 ease-out motion-reduce:transition-none ${hoverOnly}:group-hover:scale-[1.035]`}
        >
          <ProductImage
            image={product.image}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        </div>
        <span
          aria-hidden="true"
          className={`bg-paper/90 absolute inset-x-0 bottom-0 hidden translate-y-full py-3 text-center text-[0.7rem] tracking-[0.16em] uppercase transition-transform duration-200 ease-out group-focus-visible:translate-y-0 motion-reduce:transition-none ${hoverOnly}:block ${hoverOnly}:group-hover:translate-y-0`}
        >
          {ru.catalog.details}
        </span>
      </div>
      <h3 className="mt-4 font-serif text-xl leading-snug">{product.name}</h3>
      <p className="text-muted mt-1 text-sm">
        {ru.catalog.metals[product.metal] ?? product.metal} {product.purity}
        {product.stones[0] && <> · {product.stones[0].name}</>}
      </p>
      <p className="mt-2 text-sm">
        {product.in_stock ? (
          formatPrice(product.price_from_minor)
        ) : (
          <span className="text-muted">{ru.product.outOfStock}</span>
        )}
      </p>
    </Link>
  );
}
