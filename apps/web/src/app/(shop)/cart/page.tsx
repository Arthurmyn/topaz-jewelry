import Link from "next/link";
import { ru } from "@/content/ru";
import { Button } from "@/components/ui/button";

export const metadata = { title: ru.cart.title, robots: { index: false } };

// Placeholder until the cart and checkout module is built (see ARCHITECTURE.md, day 6).
export default function CartPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">{ru.cart.title}</h1>
      <p className="text-muted mt-3">{ru.cart.empty}</p>
      <Button asChild className="mt-8">
        <Link href="/catalog">{ru.cart.toCatalog}</Link>
      </Button>
    </div>
  );
}
