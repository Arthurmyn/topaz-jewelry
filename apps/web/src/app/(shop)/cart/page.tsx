import type { Metadata } from "next";
import { CartView } from "@/components/shop/cart-view";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.cart.title, robots: { index: false } };
}

export default function CartPage() {
  return <CartView />;
}
