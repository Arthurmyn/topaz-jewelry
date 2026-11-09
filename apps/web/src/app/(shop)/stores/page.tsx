import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Section } from "@/components/ui/section";
import { FittingForm } from "@/components/shop/fitting-form";
import { SITE } from "@/content/site";
import { getDict } from "@/lib/i18n-server";
import { fmt } from "@/lib/text";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.stores.page.title, alternates: { canonical: "/stores" } };
}

export default async function StoresPage() {
  const dict = await getDict();
  const s = dict.stores;
  const stores = (["astana", "karaganda"] as const).map((id) => ({
    id,
    ...s[id],
    route: SITE.stores[id].routeUrl,
  }));

  return (
    <>
      <Breadcrumbs
        items={[{ label: dict.common.home, href: "/" }, { label: dict.header.nav.stores }]}
      />
      <div className="px-page flex flex-col gap-2.5 py-5">
        <h1 className="text-32 md:text-40 text-ink font-medium">{s.page.title}</h1>
        <p className="text-16 text-muted">{s.page.subtitle}</p>
      </div>

      <div className="px-page flex flex-col gap-14 pt-6 pb-[72px]">
        {stores.map((store) => (
          <section
            key={store.id}
            aria-labelledby={`store-${store.id}`}
            className="flex flex-col gap-8 lg:flex-row lg:gap-12"
          >
            <div className="flex w-full flex-col items-start gap-3.5 lg:w-[420px] lg:shrink-0">
              <h2 id={`store-${store.id}`} className="text-28 text-ink font-medium">
                {store.city}
              </h2>
              <p className="text-15 text-ink">{store.address}</p>
              <p className="text-15 text-muted">{store.hours}</p>
              <p className="text-15 text-muted">{fmt(store.phone, { phone: SITE.phoneDisplay })}</p>
              <p className="text-15 text-muted">
                {fmt(store.whatsapp, { phone: SITE.phoneDisplay })}
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href={store.route} target="_blank" rel="noopener noreferrer">
                  {s.page.route}
                </a>
              </Button>
              <Button asChild className="w-full">
                <Link href={`/stores?store=${store.id}#fitting`}>{s.page.fitting}</Link>
              </Button>
            </div>
            <PhotoPlaceholder label={s.page.map} className="h-[300px] w-full flex-1 lg:h-[380px]" />
          </section>
        ))}
      </div>

      <Section
        id="fitting"
        bg="soft"
        innerClassName="flex flex-col items-center gap-7 py-[72px] text-center"
      >
        <h2 className="text-28 md:text-32 text-ink font-medium">{s.page.form.title}</h2>
        <p className="text-16 text-muted">{s.page.form.text}</p>
        <Suspense>
          <FittingForm />
        </Suspense>
      </Section>
    </>
  );
}
