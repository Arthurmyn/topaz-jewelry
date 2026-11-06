import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ru } from "@/content/ru";
import { serverApi } from "@/lib/api/client";
import { getConfig } from "@/lib/features";
import { whatsappLink } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/product-card";
import { ProductImage } from "@/components/shop/product-image";
import { VariantPicker } from "@/components/shop/variant-picker";

type Params = Promise<{ slug: string }>;

async function load(slug: string) {
  const { data } = await serverApi(300).GET("/api/v1/products/{slug}", {
    params: { path: { slug } },
  });
  return data;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await load((await params).slug);
  if (!product) return {};
  const image = product.images[0];
  return {
    title: product.name,
    description: product.description ?? undefined,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      images: image ? [`/media/${image.storage_key}/960.webp`] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const slug = (await params).slug;
  const product = await load(slug);
  if (!product) notFound();

  const [{ data: related }, config] = await Promise.all([
    serverApi(300).GET("/api/v1/products/{slug}/related", { params: { path: { slug } } }),
    getConfig(),
  ]);

  const prices = product.variants.map((v) => v.price_minor);
  const inStock = product.variants.some((v) => v.available_qty > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    sku: product.variants[0]?.sku,
    image: product.images.map((i) => `/media/${i.storage_key}/960.webp`),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "KZT",
      lowPrice: Math.min(...prices) / 100,
      highPrice: Math.max(...prices) / 100,
      offerCount: product.variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const rows: [string, string][] = [
    [ru.product.metal, ru.catalog.metals[product.metal] ?? product.metal],
    [ru.product.purity, String(product.purity)],
  ];
  if (product.gold_color)
    rows.push([ru.product.color, ru.product.goldColors[product.gold_color] ?? product.gold_color]);
  if (product.weight_g)
    rows.push([ru.product.weight, `${product.weight_g} ${ru.product.gramsSuffix}`]);
  if (product.stones.length)
    rows.push([ru.product.stones, product.stones.map((s) => s.name).join(", ")]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav className="text-muted mb-6 text-sm">
        <Link href="/catalog">{ru.catalog.title}</Link> /{" "}
        <Link href={`/catalog/${product.category_slug}`}>{product.category_name}</Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-4">
          {product.images.length ? (
            product.images.map((img, i) => (
              <ProductImage
                key={img.storage_key}
                image={img}
                priority={i === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            ))
          ) : (
            <ProductImage image={null} sizes="50vw" />
          )}
        </div>

        <div>
          <h1 className="font-serif text-4xl">{product.name}</h1>
          <div className="mt-6">
            <VariantPicker variants={product.variants} />
          </div>
          {config.whatsapp_number && (
            <Button asChild variant="outline" className="mt-6">
              <a
                href={whatsappLink(config.whatsapp_number, `${product.name}`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ru.product.askWhatsapp}
              </a>
            </Button>
          )}

          <dl className="border-line mt-8 divide-y border-y text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between py-2">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          {product.description && (
            <div className="mt-8">
              <h2 className="font-serif text-2xl">{ru.product.description}</h2>
              <p className="mt-2 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-3xl">{ru.product.related}</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
