import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { PageIntro } from "@/components/shop/page-intro";
import { SITE } from "@/content/site";
import { getDict } from "@/lib/i18n-server";
import { fmt } from "@/lib/text";

type Params = Promise<{ slug: string }>;
const IDS = ["astana", "karaganda"] as const;
type StoreSlug = (typeof IDS)[number];
const isStore = (v: string): v is StoreSlug => (IDS as readonly string[]).includes(v);

export function generateStaticParams() {
  return IDS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const slug = (await params).slug;
  if (!isStore(slug)) return {};
  const dict = await getDict();
  return { title: dict.stores[slug].city, alternates: { canonical: `/stores/${slug}` } };
}

export default async function StorePage({ params }: { params: Params }) {
  const slug = (await params).slug;
  if (!isStore(slug)) notFound();
  const dict = await getDict();
  const store = dict.stores[slug];
  const d = dict.storeDetail;

  return (
    <>
      <PageIntro
        crumbs={[
          { label: dict.common.home, href: "/" },
          { label: dict.header.nav.stores, href: "/stores" },
          { label: store.city },
        ]}
        title={store.city}
        subtitle={store.address}
      />
      <div className="px-page flex flex-col gap-10 pt-6 pb-16 lg:flex-row lg:gap-12">
        <div className="flex w-full flex-col items-start gap-3.5 lg:w-[420px] lg:shrink-0">
          <p className="text-15 text-muted">{store.hours}</p>
          <p className="text-15 text-muted">{fmt(store.phone, { phone: SITE.phoneDisplay })}</p>
          <p className="text-15 text-muted">{fmt(store.whatsapp, { phone: SITE.phoneDisplay })}</p>
          <Button asChild variant="outline" className="w-full">
            <a href={SITE.stores[slug].routeUrl} target="_blank" rel="noopener noreferrer">
              {dict.stores.page.route}
            </a>
          </Button>
          <Button asChild className="w-full">
            <Link href={`/stores?store=${slug}#fitting`}>{dict.stores.page.fitting}</Link>
          </Button>
        </div>
        <PhotoPlaceholder
          label={dict.stores.page.map}
          className="h-[300px] w-full flex-1 lg:h-[380px]"
        />
      </div>
      <section className="px-page flex flex-col gap-4 pb-16">
        <h2 className="text-24 text-ink font-medium">{d.howTo}</h2>
        <p className="text-15 text-muted max-w-2xl leading-6">{d.howToText}</p>
      </section>
      <div className="px-page reveal-group grid gap-4 pb-16 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <PhotoPlaceholder key={i} label={d.gallery} className="h-[220px] w-full" />
        ))}
      </div>
      <div className="px-page pb-24">
        <Link href="/stores" className="text-14 text-ink font-medium whitespace-pre">
          {d.allStores}
        </Link>
      </div>
    </>
  );
}
