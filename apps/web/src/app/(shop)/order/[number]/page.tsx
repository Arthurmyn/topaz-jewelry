import type { Metadata } from "next";
import { OrderView } from "@/components/shop/order-view";
import { getDict } from "@/lib/i18n-server";
import { fmt } from "@/lib/text";

type Params = Promise<{ number: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: fmt(dict.order.title, { number: (await params).number }),
    robots: { index: false },
  };
}

export default async function OrderPage({ params }: { params: Params }) {
  return <OrderView number={(await params).number} />;
}
