"use client";

import Link from "next/link";
import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useDict, useFeatures, useLocale, useMoney } from "@/components/providers/app-providers";
import { resolveLines, sumKzt } from "@/lib/cart-items";
import { productHref, productSubtitle, productTitle } from "@/lib/products";
import { removeLine, setLineQty, useCartLines, type CartLine } from "@/lib/state/cart";
import { cn } from "@/lib/cn";
import { fmt, plural } from "@/lib/text";

export function CartView() {
  const dict = useDict();
  const locale = useLocale();
  const money = useMoney();
  const { accounts } = useFeatures();
  const c = dict.cart;
  const lines = resolveLines(useCartLines());
  const itemCount = lines.reduce((n, l) => n + l.line.qty, 0);
  const [promoError, setPromoError] = useState(false);
  const [removing, setRemoving] = useState<ReadonlySet<string>>(new Set());

  /** Collapse the row first (so the list does not jump), then delete it from the cart. */
  function removeAnimated(rowKey: string, line: CartLine) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setRemoving((prev) => new Set(prev).add(rowKey));
    window.setTimeout(
      () => {
        removeLine(line);
        setRemoving((prev) => {
          const next = new Set(prev);
          next.delete(rowKey);
          return next;
        });
      },
      reduced ? 0 : 200,
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: dict.common.home, href: "/" }, { label: c.title }]} />
      <div className="px-page flex items-center gap-4 py-5">
        <h1 className="text-32 md:text-40 text-ink font-medium">{c.title}</h1>
        {lines.length > 0 && (
          <p className="text-14 text-muted">{plural(c.count, itemCount, locale)}</p>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="px-page flex flex-col items-start gap-6 pt-6 pb-24">
          <p className="text-16 text-muted">{c.empty}</p>
          <Button asChild>
            <Link href="/catalog">{c.toCatalog}</Link>
          </Button>
        </div>
      ) : (
        <div className="px-page flex flex-col gap-10 pt-6 pb-24 lg:flex-row lg:gap-16">
          <div className="flex min-w-0 flex-1 flex-col">
            <ul className="border-border border-b">
              {lines.map(({ line, product, totalKzt }) => {
                const rowKey = `${line.productId}-${line.purity}-${line.size ?? "x"}`;
                return (
                  <li
                    key={rowKey}
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-opacity",
                      removing.has(rowKey)
                        ? "grid-rows-[0fr] opacity-0"
                        : "grid-rows-[1fr] opacity-100",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-border flex gap-4 border-t py-7 sm:gap-6">
                        <Link
                          href={productHref(product)}
                          aria-label={productTitle(product, dict)}
                          className="shrink-0"
                        >
                          <PhotoPlaceholder
                            label={dict.common.photo}
                            className="h-[120px] w-[96px] sm:h-[150px] sm:w-[120px]"
                          />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                          <Link
                            href={productHref(product)}
                            className="text-16 text-ink font-medium underline decoration-transparent underline-offset-4 transition-colors duration-150 hover:decoration-current"
                          >
                            {productTitle(product, dict)}
                          </Link>
                          <p className="text-13 text-muted">
                            {productSubtitle(product, line.purity, dict)}
                          </p>
                          {line.size !== null && (
                            <p className="text-13 text-muted">{fmt(c.size, { size: line.size })}</p>
                          )}
                          <p className="text-13 text-muted">
                            {fmt(c.article, { article: product.article })}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeAnimated(rowKey, line)}
                            className="text-13 text-ink font-medium underline underline-offset-2"
                          >
                            {c.remove}
                          </button>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-5">
                          <QuantityStepper
                            value={line.qty}
                            onChange={(qty) => setLineQty(line, qty)}
                            decreaseLabel={c.decrease}
                            increaseLabel={c.increase}
                          />
                          <p className="text-18 text-ink font-medium">{money(totalKzt)}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/catalog"
              className="text-14 text-ink hover:text-muted pt-6 font-medium whitespace-pre transition-colors duration-150"
            >
              {c.back}
            </Link>
          </div>

          <aside className="bg-soft flex w-full flex-col gap-5 self-start p-8 lg:w-[400px] lg:shrink-0">
            <h2 className="text-20 text-ink font-medium">{c.summary}</h2>
            <div className="text-14 flex items-center justify-between">
              <span className="text-muted">{fmt(c.items, { n: itemCount })}</span>
              <span className="text-ink">{money(sumKzt(lines))}</span>
            </div>
            <div className="text-14 flex items-center justify-between">
              <span className="text-muted">{c.delivery}</span>
              <span className="text-ink">{c.deliveryValue}</span>
            </div>
            <div className="bg-border h-px w-full" />
            <div className="text-ink flex items-center justify-between font-medium">
              <span className="text-16">{c.total}</span>
              <span className="text-20">{money(sumKzt(lines))}</span>
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                // Frontend-only: there are no promo codes yet, so every code is rejected.
                setPromoError(true);
              }}
            >
              <label htmlFor="promo" className="sr-only">
                {c.promo}
              </label>
              <Input
                id="promo"
                name="promo"
                placeholder={c.promo}
                className="text-13 h-auto min-w-0 flex-1 px-3.5 py-3"
                aria-invalid={promoError}
              />
              <Chip type="submit" size="md">
                {c.apply}
              </Chip>
            </form>
            {promoError && (
              <p role="alert" className="text-13 text-error -mt-2">
                {c.promoInvalid}
              </p>
            )}
            <Button asChild className="w-full">
              <Link href="/checkout">{c.checkout}</Link>
            </Button>
            <p className="text-13 text-muted leading-5">
              {accounts ? c.noteWithAccounts : c.noteGuest}
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
