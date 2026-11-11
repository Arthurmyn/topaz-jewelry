import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/shop/page-intro";
import { getDictionary } from "@/content/dictionaries";
import { SITE } from "@/content/site";
import { getDict } from "@/lib/i18n-server";
import { fmt } from "@/lib/text";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getDictionary("ru").services.items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const dict = await getDict();
  const { slug } = await params;
  const item = dict.services.items.find((i) => i.slug === slug);
  return item ? { title: item.title, alternates: { canonical: `/services/${item.slug}` } } : {};
}

export default async function ServicePage({ params }: { params: Params }) {
  const dict = await getDict();
  const { slug } = await params;
  const s = dict.services;
  const item = s.items.find((i) => i.slug === slug);
  if (!item) notFound();
  const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(fmt(s.whatsappPrefill, { name: item.title }))}`;

  return (
    <>
      <PageIntro
        crumbs={[
          { label: dict.common.home, href: "/" },
          { label: s.breadcrumb, href: "/services" },
          { label: item.title },
        ]}
        title={item.title}
        subtitle={item.text}
      />
      <div className="px-page flex flex-col gap-10 pt-6 pb-24">
        <p className="text-16 text-muted max-w-2xl leading-[26px]">{item.intro}</p>
        <section className="flex flex-col gap-6">
          <h2 className="text-24 text-ink font-medium">{s.stepsTitle}</h2>
          <ol className="reveal-group grid gap-6 md:grid-cols-3">
            {item.steps.map((step, i) => (
              <li key={step.title} className="border-border flex flex-col gap-3 border px-7 py-8">
                <span className="text-13 text-muted">{i + 1}</span>
                <p className="text-18 text-ink font-medium">{step.title}</p>
                <p className="text-14 text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <div className="flex flex-wrap items-center gap-6">
          <Button asChild>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              {s.contact}
            </a>
          </Button>
          <Link href="/services" className="text-14 text-ink font-medium whitespace-pre">
            {s.back}
          </Link>
        </div>
      </div>
    </>
  );
}
