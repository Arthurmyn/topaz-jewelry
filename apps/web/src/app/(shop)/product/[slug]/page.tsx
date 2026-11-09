import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/components/shop/product-card";
import { ProductDetail } from "@/components/shop/product-detail";
import { ProductGrid } from "@/components/shop/product-grid";
import { PRODUCTS, getProduct } from "@/content/mock/products";
import { getDict } from "@/lib/i18n-server";
import { productTitle } from "@/lib/products";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  const dict = await getDict();
  return {
    title: productTitle(product, dict),
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const dict = await getDict();

  const similar = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: dict.common.home, href: "/" },
          { label: dict.categories[product.category], href: `/catalog/${product.category}` },
          { label: productTitle(product, dict) },
        ]}
      />
      <ProductDetail product={product} />
      {similar.length > 0 && (
        <Section bg="soft" innerClassName="flex flex-col items-center gap-10 py-[72px]">
          <h2 className="text-28 md:text-32 text-ink font-medium">{dict.product.similar}</h2>
          <ProductGrid>
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        </Section>
      )}
    </>
  );
}
