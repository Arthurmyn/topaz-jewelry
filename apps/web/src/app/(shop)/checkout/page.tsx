import type { Metadata } from "next";
import { CheckoutView } from "@/components/shop/checkout-view";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.checkout.title, robots: { index: false } };
}

export default function CheckoutPage() {
  return <CheckoutView />;
}
