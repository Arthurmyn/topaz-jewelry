"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { useDict, useMoney } from "@/components/providers/app-providers";
import type { Product } from "@/content/mock/products";
import { SITE } from "@/content/site";
import { addToCart, type Purity } from "@/lib/state/cart";
import { toggleFavorite, useFavorites } from "@/lib/state/favorites";
import { productTitle, startingPurity } from "@/lib/products";
import { fmt } from "@/lib/text";

/** Wireframe product page: gallery (640) + info column with purity, size, actions, accordion. */
export function ProductDetail({ product }: { product: Product }) {
  const dict = useDict();
  const money = useMoney();
  const p = dict.product;
  const favorites = useFavorites();
  const isFavorite = favorites.includes(product.id);

  const [purity, setPurity] = useState<Purity>(startingPurity(product));
  const [size, setSize] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const title = productTitle(product, dict);

  function add() {
    if (product.sizes && size === null) {
      setSizeError(true);
      return;
    }
    addToCart({ productId: product.id, purity, size });
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  }

  function askWhatsapp() {
    const text = fmt(p.whatsappPrefill, {
      name: title,
      article: product.article,
      url: window.location.href,
    });
    window.open(
      `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const stockLine =
    product.availability === "in_stock"
      ? fmt(p.stockLine, { stores: product.stores.map((s) => p.storeNames[s]).join(", ") })
      : p.onOrderLine;

  const specs: [string, string][] = [
    [p.specsLabels.material, dict.metals[String(purity) as "585" | "750"]],
    [p.specsLabels.purity, String(purity)],
    [p.specsLabels.stone, dict.stones[product.stone]],
    [p.specsLabels.article, product.article],
    ...(product.sizes
      ? ([
          [p.specsLabels.sizes, `${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}`],
        ] as [string, string][])
      : []),
  ];

  return (
    <div className="px-page mx-auto flex w-full max-w-[1440px] flex-col gap-10 pt-4 pb-20 lg:flex-row lg:gap-16">
      <div className="flex w-full flex-col gap-4 lg:w-[640px] lg:shrink-0">
        <PhotoPlaceholder
          label={p.mainPhoto}
          className="h-[420px] w-full sm:h-[560px] lg:h-[680px]"
        />
        <div className="grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <PhotoPlaceholder
              key={i}
              label={p.thumbPhoto}
              className="aspect-square w-full lg:aspect-auto lg:h-[148px]"
            />
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-6">
        <p className="text-12 text-muted tracking-eyebrow font-medium uppercase">
          {fmt(p.eyebrow, { name: product.collection })}
        </p>
        <h1 className="text-32 lg:text-36 text-ink w-full font-medium">{title}</h1>
        <p className="text-13 text-muted">{fmt(p.article, { article: product.article })}</p>
        <p className="text-28 text-ink font-medium" aria-live="polite">
          {money(product.prices[purity])}
        </p>
        <div className="bg-border h-px w-full" />

        <div className="flex flex-col items-start gap-3">
          <p className="text-14 text-ink font-medium">{p.metal}</p>
          <div className="flex flex-wrap gap-2">
            {product.purities.map((value) => (
              <Chip
                key={value}
                size="lg"
                selected={purity === value}
                onClick={() => setPurity(value)}
              >
                {dict.metals[String(value) as "585" | "750"]}
              </Chip>
            ))}
          </div>
        </div>

        {product.sizes && (
          <div className="flex w-full flex-col items-start gap-3">
            <div className="flex w-full items-center justify-between">
              <p className="text-14 text-ink font-medium">{p.size}</p>
              <Link
                href="/info/sizes"
                className="text-13 text-muted hover:text-ink underline underline-offset-2"
              >
                {p.sizeTable}
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((value) => (
                <Chip
                  key={value}
                  size="lg"
                  selected={size === value}
                  onClick={() => {
                    setSize(value);
                    setSizeError(false);
                  }}
                >
                  {value}
                </Chip>
              ))}
            </div>
            {sizeError && (
              <p role="alert" className="text-13 text-error">
                {p.chooseSize}
              </p>
            )}
          </div>
        )}

        <p className="text-14 text-muted w-full">{stockLine}</p>

        <Button className="w-full" onClick={add}>
          <span key={String(added)} className="fade-in">
            {added ? p.added : p.addToCart}
          </span>
        </Button>
        <Button variant="outline" className="w-full" onClick={askWhatsapp}>
          {p.whatsapp}
        </Button>

        <div className="text-13 text-ink flex gap-6 font-medium">
          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-pressed={isFavorite}
            className="press hover:text-muted whitespace-pre transition-colors duration-150"
          >
            <span key={String(isFavorite)} className="pop inline-block">
              {isFavorite ? p.favoriteRemove : p.favoriteAdd}
            </span>
          </button>
          <Link href="/stores" className="hover:text-muted transition-colors duration-150">
            {p.pickup}
          </Link>
        </div>

        <Accordion
          items={[
            { id: "description", title: p.accordion.description, content: p.descriptionText },
            {
              id: "specs",
              title: p.accordion.specs,
              content: (
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                  {specs.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              ),
            },
            { id: "delivery", title: p.accordion.delivery, content: p.deliveryText },
            { id: "warranty", title: p.accordion.warranty, content: p.warrantyText },
          ]}
        />
      </div>
    </div>
  );
}
