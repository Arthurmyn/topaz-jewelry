"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useDict, useLocale, useMoney } from "@/components/providers/app-providers";
import { MOCK_ORDERS } from "@/content/mock/orders";
import { PageIntro, ResultBlock } from "@/components/shop/page-intro";
import { resolveLines } from "@/lib/cart-items";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format-date";
import { productTitle } from "@/lib/products";
import { useLocalOrders } from "@/lib/state/orders";
import { fmt } from "@/lib/text";
import { useMounted } from "@/lib/use-mounted";

/**
 * Order status page. Frontend-only: finds the order among the demo orders and those placed in
 * this browser. With a backend this becomes a signed-link lookup for guests.
 */
export function OrderView({ number }: { number: string }) {
  const dict = useDict();
  const o = dict.order;
  useLocale();
  const money = useMoney();
  const mounted = useMounted();
  const local = useLocalOrders();
  if (!mounted) return null;

  const order = [...local, ...MOCK_ORDERS].find((x) => x.number === number);
  const crumbs = [{ label: dict.common.home, href: "/" }, { label: o.breadcrumb }];

  if (!order) {
    return (
      <>
        <PageIntro crumbs={crumbs} title={o.notFound} />
        <ResultBlock title={o.notFound} text={o.notFoundText}>
          <Button asChild>
            <Link href="/catalog">{o.toCatalog}</Link>
          </Button>
        </ResultBlock>
      </>
    );
  }

  const lines = resolveLines(order.lines);
  const row = "border-border flex items-center justify-between gap-6 border-b py-4 text-14";
  return (
    <>
      <PageIntro crumbs={crumbs} title={fmt(o.title, { number: order.number })} />
      <div className="px-page flex max-w-3xl flex-col gap-10 pt-6 pb-24">
        <dl>
          <div className={row}>
            <dt className="text-muted">{o.status}</dt>
            <dd>
              <span
                className={cn(
                  "text-13 inline-flex border px-3 py-2.5 font-medium",
                  order.status === "placed"
                    ? "border-ink bg-ink text-white"
                    : "border-border text-ink",
                )}
              >
                {dict.profile.orders.statuses[order.status]}
              </span>
            </dd>
          </div>
          <div className={row}>
            <dt className="text-muted">{o.date}</dt>
            <dd className="text-ink">{formatDate(order.createdAt)}</dd>
          </div>
          <div className={row}>
            <dt className="text-muted">{o.payment}</dt>
            <dd className="text-ink">{o.paymentNames[order.payment]}</dd>
          </div>
          <div className={row}>
            <dt className="text-muted">{o.delivery}</dt>
            <dd className="text-ink">{o.deliveryNames[order.delivery]}</dd>
          </div>
          <div className={cn(row, "font-medium")}>
            <dt className="text-16 text-ink">{o.total}</dt>
            <dd className="text-20 text-ink">{money(order.totalKzt)}</dd>
          </div>
        </dl>
        <section className="flex flex-col gap-4">
          <h2 className="text-24 text-ink font-medium">{o.items}</h2>
          {lines.length === 0 ? (
            <p className="text-14 text-muted">{o.itemsUnavailable}</p>
          ) : (
            <ul>
              {lines.map(({ line, product, totalKzt }) => (
                <li key={`${line.productId}-${line.purity}-${line.size ?? "x"}`} className={row}>
                  <span className="text-ink">
                    {productTitle(product, dict)}
                    {line.size !== null && ` · ${line.size}`} × {line.qty}
                  </span>
                  <span className="text-ink font-medium whitespace-nowrap">{money(totalKzt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
