"use client";

import { useState } from "react";
import { ru } from "@/content/ru";
import type { ProductDetail } from "@/lib/api/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function VariantPicker({ variants }: { variants: ProductDetail["variants"] }) {
  const firstAvailable = variants.find((v) => v.available_qty > 0) ?? variants[0];
  const [sku, setSku] = useState(firstAvailable?.sku);
  const current = variants.find((v) => v.sku === sku) ?? firstAvailable;
  if (!current) return null;

  const showSizes = variants.some((v) => v.size);
  return (
    <div>
      <p className="text-3xl font-medium">{formatPrice(current.price_minor)}</p>
      {current.old_price_minor && (
        <p className="text-muted text-sm line-through">{formatPrice(current.old_price_minor)}</p>
      )}

      {showSizes && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">{ru.product.size}</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.sku}
                type="button"
                onClick={() => setSku(v.sku)}
                aria-pressed={v.sku === current.sku}
                className={cn(
                  "h-10 min-w-12 rounded-sm border px-3 text-sm",
                  v.sku === current.sku ? "border-ink bg-ink text-paper" : "border-line",
                  v.available_qty === 0 && "text-muted line-through",
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 text-sm">
        {current.available_qty === 0
          ? ru.product.outOfStock
          : current.available_qty === 1
            ? ru.product.lastOne
            : ru.product.inStock}
      </p>
      <p className="text-muted mt-1 text-xs">
        {ru.product.sku}: {current.sku}
      </p>
    </div>
  );
}
