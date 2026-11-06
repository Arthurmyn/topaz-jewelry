import Link from "next/link";
import { ru } from "@/content/ru";
import { serverApi } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Placeholder, type Tone } from "@/components/ui/placeholder";
import { Carousel } from "@/components/shop/carousel";
import { HeroCarousel } from "@/components/shop/hero-carousel";
import { HeroSlide } from "@/components/shop/hero-slide";
import { NewsletterForm } from "@/components/shop/newsletter-form";
import { ProductCard } from "@/components/shop/product-card";

const SLIDE_TONES: readonly (readonly [Tone, Tone, Tone])[] = [
  ["b", "a", "c"],
  ["c", "a", "d"],
  ["d", "a", "b"],
];
const TILE_TONES: readonly Tone[] = ["a", "b", "c", "d"];

export default async function HomePage() {
  const api = serverApi(300);
  const [{ data: products }, { data: categories }, { data: stores }] = await Promise.all([
    api.GET("/api/v1/products", { params: { query: { page_size: 10, sort: "newest" } } }),
    api.GET("/api/v1/categories"),
    api.GET("/api/v1/stores"),
  ]);

  // Tiles: root categories plus their children (wedding rings get their own tile).
  const tiles = (categories ?? []).flatMap((c) => [c, ...c.children]);

  return (
    <>
      <h1 className="sr-only">{ru.site.name}</h1>
      <HeroCarousel
        slides={ru.home.heroSlides.map((s, i) => (
          <HeroSlide
            key={s.title}
            {...s}
            heading="h2"
            intro={i === 0}
            tones={SLIDE_TONES[i % SLIDE_TONES.length]!}
          />
        ))}
      />

      <section className="mx-auto max-w-[1600px] px-4 pt-3 md:px-8">
        <ul className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:px-0 lg:grid-cols-6">
          {tiles.map((c, i) => (
            <li key={c.slug} className="reveal-on-scroll w-40 shrink-0 md:w-auto">
              <Link href={`/catalog/${c.slug}`} className="group block">
                <div className="overflow-hidden">
                  <Placeholder
                    tone={TILE_TONES[i % TILE_TONES.length]!}
                    className="aspect-[4/5] w-full transition-transform duration-700 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-4 text-center text-[0.8rem] tracking-[0.16em] uppercase">
                  {c.name}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="reveal-on-scroll mx-auto max-w-2xl px-4 py-24 text-center">
        <h2 className="font-serif text-4xl leading-tight font-normal md:text-5xl">
          {ru.home.statementTitle}
        </h2>
        <p className="text-muted mt-4 text-lg">{ru.home.statementText}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/catalog">{ru.home.statementCta}</Link>
        </Button>
      </section>

      <section className="mx-auto max-w-[1600px] px-4 md:px-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-3xl md:text-4xl">{ru.home.newArrivals}</h2>
          <Link
            href="/catalog?sort=newest"
            className="hover:text-gold-dark text-xs tracking-[0.16em] uppercase underline decoration-1 underline-offset-[6px] transition-colors duration-150"
          >
            {ru.home.allNew}
          </Link>
        </div>
        <Carousel
          label={ru.home.newArrivalsLabel}
          prevLabel={ru.home.carouselPrev}
          nextLabel={ru.home.carouselNext}
          className="mt-8"
        >
          {(products?.items ?? []).map((p) => (
            <li key={p.slug} className="w-[68%] shrink-0 snap-start sm:w-[40%] lg:w-[24%]">
              <ProductCard product={p} />
            </li>
          ))}
        </Carousel>
      </section>

      <section className="mx-auto mt-28 max-w-[1600px] px-4 md:px-8">
        <h2 className="reveal-on-scroll font-serif text-3xl md:text-4xl">{ru.home.whyTitle}</h2>
        <ul className="border-line mt-8 grid divide-y border-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {ru.home.why.map((w) => (
            <li
              key={w.title}
              className="reveal-on-scroll px-0 py-8 md:px-10 md:first:pl-0 md:last:pr-0"
            >
              <h3 className="font-serif text-2xl">{w.title}</h3>
              <p className="text-muted mt-2 max-w-xs">{w.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {stores && stores.length > 0 && (
        <section className="mx-auto mt-28 max-w-[1600px] px-4 md:px-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-3xl md:text-4xl">{ru.home.salonsTitle}</h2>
            <Link
              href="/stores"
              className="hover:text-gold-dark text-xs tracking-[0.16em] uppercase underline decoration-1 underline-offset-[6px] transition-colors duration-150"
            >
              {ru.home.allSalons}
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {stores.map((s, i) => (
              <li key={s.slug} className="reveal-on-scroll bg-sand grid sm:grid-cols-2">
                <Placeholder
                  tone={i % 2 ? "c" : "b"}
                  caption
                  className="aspect-[4/3] sm:aspect-auto sm:min-h-64"
                />
                <div className="flex flex-col justify-center gap-2 p-8">
                  <h3 className="font-serif text-3xl">{s.city}</h3>
                  <p>{s.address}</p>
                  {s.opening_hours &&
                    Object.entries(s.opening_hours).map(([d, h]) => (
                      <p key={d} className="text-muted text-sm">
                        {d}: {h}
                      </p>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-sand mt-28 grid grid-cols-[minmax(0,1fr)] md:grid-cols-2">
        <div className="reveal-on-scroll flex flex-col justify-center px-6 py-16 md:px-16">
          <h2 className="font-serif text-4xl md:text-5xl">{ru.newsletter.title}</h2>
          <p className="text-muted mt-3 mb-8 max-w-md">{ru.newsletter.text}</p>
          <NewsletterForm />
        </div>
        <Placeholder tone="d" caption className="min-h-72" />
      </section>
    </>
  );
}
