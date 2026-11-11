import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaymentReturnView } from "@/components/shop/payment-return-view";
import { getFeatures } from "@/lib/features";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.payment.breadcrumb, robots: { index: false } };
}

export default function PaymentReturnPage() {
  if (!getFeatures().payments) notFound(); // payments module is switched off
  return (
    <Suspense>
      <PaymentReturnView />
    </Suspense>
  );
}
