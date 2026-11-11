"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDict } from "@/components/providers/app-providers";
import { PageIntro, ResultBlock } from "@/components/shop/page-intro";
import { fmt } from "@/lib/text";

/**
 * Landing page after the payment provider. Never trust the browser redirect: with a backend this page
 * only polls the order status (payments are confirmed by verified webhooks). Frontend-only demo: the
 * outcome comes from `?status=` after a short "checking" moment.
 */
export function PaymentReturnView() {
  const dict = useDict();
  const p = dict.payment;
  const params = useSearchParams();
  const number = params.get("order") ?? "";
  const outcome = params.get("status") === "failed" ? "failed" : "succeeded";
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => setChecking(false), reduced ? 0 : 900);
    return () => window.clearTimeout(id);
  }, []);

  const crumbs = [{ label: dict.common.home, href: "/" }, { label: p.breadcrumb }];
  return (
    <>
      <PageIntro crumbs={crumbs} title={p.breadcrumb} />
      {checking ? (
        <ResultBlock title={p.pending} text={p.pendingText} />
      ) : outcome === "succeeded" ? (
        <ResultBlock title={p.succeeded} text={fmt(p.succeededText, { number })}>
          {number && (
            <Button asChild>
              <Link href={`/order/${number}`}>{p.toOrder}</Link>
            </Button>
          )}
        </ResultBlock>
      ) : (
        <ResultBlock title={p.failed} text={p.failedText}>
          <Button asChild>
            <Link href="/checkout">{p.retry}</Link>
          </Button>
        </ResultBlock>
      )}
    </>
  );
}
