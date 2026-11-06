import Link from "next/link";
import { ru } from "@/content/ru";
import { serverApi } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";

export default async function HomePage() {
  const api = serverApi(300);
  const [{ data: products }, { data: categories }] = await Promise.all([
    api.GET("/api/v1/products", { params: { query: { page_size: 8, sort: "newest" } } }),
    api.GET("/api/v1/categories"),
  ]);

  return (
    <>
      <section className="bg-sand">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="font-serif text-5xl md:text-6xl">{ru.home.heroTitle}</h1>
          <p className="text-muted mt-4 text-lg">{ru.home.heroSubtitle}</p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/catalog">{ru.home.heroCta}</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="font-serif text-3xl">{ru.home.categories}</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {(categories ?? []).map((c) => (
            <Link
              key={c.slug}
              href={`/catalog/${c.slug}`}
              className="border-line hover:border-ink rounded-sm border px-5 py-3"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4">
        <h2 className="font-serif text-3xl">{ru.home.newArrivals}</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {(products?.items ?? []).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
