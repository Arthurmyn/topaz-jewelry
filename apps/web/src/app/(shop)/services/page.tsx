import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/shop/page-intro";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.services.title, alternates: { canonical: "/services" } };
}

export default async function ServicesPage() {
  const dict = await getDict();
  const s = dict.services;
  return (
    <>
      <PageIntro
        crumbs={[{ label: dict.common.home, href: "/" }, { label: s.breadcrumb }]}
        title={s.title}
        subtitle={s.subtitle}
      />
      <div className="px-page pt-6 pb-24">
        <ul className="reveal-group grid gap-6 md:grid-cols-3">
          {s.items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/services/${item.slug}`}
                className="press border-border hover:border-ink flex h-full flex-col gap-3 border px-7 py-8 transition-colors duration-150"
              >
                <p className="text-18 text-ink font-medium">{item.title}</p>
                <p className="text-14 text-muted">{item.text}</p>
                <span className="text-13 text-ink mt-auto pt-4 font-medium underline underline-offset-2">
                  {s.more}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
