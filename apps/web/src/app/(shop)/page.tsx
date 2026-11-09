import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { HeroSlider } from "@/components/shop/hero-slider";
import { NewsletterForm } from "@/components/shop/newsletter-form";
import { ProductCard } from "@/components/shop/product-card";
import { ProductGrid } from "@/components/shop/product-grid";
import { PRODUCTS, productsByCategory } from "@/content/mock/products";
import { getDict } from "@/lib/i18n-server";

const HERO_LINKS = ["/catalog?sort=new", "/catalog/rings?type=wedding", "/catalog?priceMax=100000"];

export default async function HomePage() {
  const dict = await getDict();
  const h = dict.home;

  const categories = [
    { label: dict.categories.rings, href: "/catalog/rings" },
    { label: dict.categories.earrings, href: "/catalog/earrings" },
    { label: dict.categories.necklaces, href: "/catalog/necklaces" },
    { label: dict.categories.bracelets, href: "/catalog/bracelets" },
    { label: dict.ringTypes.wedding, href: "/catalog/rings?type=wedding" },
    { label: dict.categories.pendants, href: "/catalog/pendants" },
  ];
  const tiles = [
    { label: dict.categories.new, href: "/catalog?sort=new" },
    { label: dict.categories.earrings, href: "/catalog/earrings" },
    { label: dict.categories.necklaces, href: "/catalog/necklaces" },
  ];
  const bestsellers = [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  const rings = productsByCategory("rings")
    .filter((p) => p.ringType === "ring")
    .slice(0, 4);
  const stores = [
    { id: "astana", ...dict.stores.astana },
    { id: "karaganda", ...dict.stores.karaganda },
  ];

  return (
    <>
      <HeroSlider
        slides={h.heroSlides.map((s, i) => ({ ...s, href: HERO_LINKS[i] ?? "/catalog" }))}
        photoLabel={h.heroPhoto}
        label={h.heroLabel}
        goToLabel={h.heroGoTo}
      />

      <Section innerClassName="py-16">
        <ul className="reveal-group no-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:justify-center md:gap-x-14 md:gap-y-8 md:overflow-visible md:px-0">
          {categories.map((c) => (
            <li key={c.label} className="shrink-0">
              <Link href={c.href} className="group flex flex-col items-center gap-4">
                <PhotoPlaceholder
                  zoom
                  label={dict.common.photo}
                  className="size-[120px] rounded-full"
                />
                <span className="text-14 text-ink font-medium underline decoration-transparent underline-offset-4 transition-colors duration-150 group-hover:decoration-current">
                  {c.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section innerClassName="flex flex-col items-center gap-10 py-[72px]">
        <SectionHeading
          title={h.bestsellers.title}
          subtitle={h.bestsellers.subtitle}
          linkLabel={dict.common.seeAll}
          href="/catalog"
        />
        <ProductGrid reveal>
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ProductGrid>
      </Section>

      <section className="flex min-h-[560px] w-full flex-col lg:h-[560px] lg:flex-row">
        <PhotoPlaceholder
          label={h.wedding.photo}
          className="h-[360px] w-full lg:h-full lg:w-1/2 lg:shrink-0"
        />
        <div className="bg-soft reveal flex min-w-0 flex-1 flex-col items-start justify-center gap-5 px-6 py-16 md:px-16 xl:px-24">
          <p className="text-12 text-muted tracking-eyebrow font-medium uppercase">
            {h.wedding.eyebrow}
          </p>
          <h2 className="text-32 lg:text-40 text-ink font-medium lg:leading-[48px]">
            {h.wedding.title}
          </h2>
          <p className="text-16 text-muted">{h.wedding.text}</p>
          <Button asChild variant="outline">
            <Link href="/catalog/rings?type=wedding">{h.wedding.cta}</Link>
          </Button>
        </div>
      </section>

      <Section innerClassName="flex flex-col items-center gap-8 py-[72px]">
        <h2 className="reveal text-24 md:text-28 text-ink text-center font-medium">
          {h.trust.title}
        </h2>
        <ul className="reveal-group grid w-full grid-cols-2 gap-6 lg:grid-cols-4">
          {h.trust.items.map((item) => (
            <li
              key={item.title}
              className="border-border flex flex-col items-center gap-2 border px-6 py-7 text-center"
            >
              <p className="text-15 text-ink w-full font-medium">{item.title}</p>
              <p className="text-13 text-muted w-full">{item.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section innerClassName="pb-[72px]">
        <ul className="reveal-group grid gap-6 md:grid-cols-3">
          {tiles.map((t) => (
            <li key={t.label}>
              <Link href={t.href} className="group flex flex-col items-start gap-4">
                <PhotoPlaceholder
                  zoom
                  label={h.tilePhoto}
                  className="h-[360px] w-full md:h-[480px]"
                />
                <span className="text-20 text-ink font-medium">{t.label}</span>
                <span className="text-13 text-ink font-medium underline underline-offset-2">
                  {dict.common.see}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section bg="soft" innerClassName="flex flex-col items-center gap-10 py-[72px]">
        <SectionHeading
          title={h.rings.title}
          subtitle={h.rings.subtitle}
          linkLabel={dict.common.seeAll}
          href="/catalog/rings"
        />
        <ProductGrid reveal>
          {rings.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ProductGrid>
      </Section>

      <Section
        bg="dark"
        innerClassName="flex flex-col gap-12 py-[88px] lg:flex-row lg:items-center lg:gap-20"
      >
        <div className="reveal flex flex-1 flex-col items-start gap-5">
          <p className="text-12 text-muted-on-dark tracking-eyebrow font-medium uppercase">
            {h.stores.eyebrow}
          </p>
          <h2 className="text-28 md:text-36 font-medium text-white md:leading-[44px]">
            {h.stores.title}
          </h2>
          <p className="text-16 text-muted-on-dark">{h.stores.text}</p>
          <Button asChild variant="light">
            <Link href="/stores">{h.stores.cta}</Link>
          </Button>
        </div>
        <ul className="reveal-group flex w-full flex-1 flex-col gap-6 sm:flex-row">
          {stores.map((s) => (
            <li key={s.id} className="border-muted-on-dark flex flex-1 flex-col gap-2.5 border p-7">
              <p className="text-20 font-medium text-white">{s.city}</p>
              <p className="text-14 text-muted-on-dark">{s.address}</p>
              <p className="text-14 text-muted-on-dark">{s.short}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section innerClassName="flex flex-col gap-12 py-24 lg:flex-row lg:items-center lg:gap-20">
        <div className="reveal flex flex-1 flex-col items-start gap-5">
          <p className="text-12 text-muted tracking-eyebrow font-medium uppercase">
            {h.brand.eyebrow}
          </p>
          <h2 className="text-28 md:text-36 text-ink font-medium md:leading-[44px]">
            {h.brand.title}
          </h2>
          <p className="text-16 text-muted leading-[26px]">{h.brand.text}</p>
          <Button asChild variant="outline">
            <Link href="/about">{h.brand.cta}</Link>
          </Button>
        </div>
        <PhotoPlaceholder
          label={h.brand.photo}
          className="h-[320px] w-full lg:h-[440px] lg:w-[560px] lg:shrink-0"
        />
      </Section>

      <Section bg="soft" innerClassName="reveal flex flex-col items-center gap-5 py-20 text-center">
        <h2 className="text-28 md:text-32 text-ink font-medium">{h.newsletter.title}</h2>
        <p className="text-16 text-muted">{h.newsletter.text}</p>
        <NewsletterForm />
      </Section>
    </>
  );
}
