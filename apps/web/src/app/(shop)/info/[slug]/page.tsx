import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SideNav } from "@/components/ui/side-nav";
import { getDictionary } from "@/content/dictionaries";
import { getDict } from "@/lib/i18n-server";
import { INFO_NAV_ORDER, isInfoSlug } from "@/lib/routes";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return Object.keys(getDictionary("ru").info.pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const dict = await getDict();
  const { slug } = await params;
  if (!isInfoSlug(slug, dict.info.pages)) return {};
  return { title: dict.info.pages[slug].title, alternates: { canonical: `/info/${slug}` } };
}

export default async function InfoPage({ params }: { params: Params }) {
  const dict = await getDict();
  const { slug } = await params;
  if (!isInfoSlug(slug, dict.info.pages)) notFound();
  const page = dict.info.pages[slug];
  const showFaq = slug === "delivery" || slug === "faq";

  return (
    <>
      <Breadcrumbs
        items={[
          { label: dict.common.home, href: "/" },
          { label: dict.info.breadcrumb },
          { label: page.title },
        ]}
      />
      <div className="px-page flex flex-col gap-10 pt-6 pb-24 lg:flex-row lg:gap-16">
        <SideNav
          label={dict.info.breadcrumb}
          items={INFO_NAV_ORDER.map((key) => ({
            label: dict.info.nav[key],
            href: `/info/${key}`,
            active: key === slug,
          }))}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-10">
          <h1 className="text-32 md:text-40 text-ink font-medium">{page.title}</h1>
          {page.sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <h2 className="text-22 text-ink font-medium">{section.title}</h2>
              {section.text.map((line) => (
                <p key={line} className="text-15 text-muted leading-6">
                  {line}
                </p>
              ))}
            </section>
          ))}
          {showFaq && (
            <section className="flex flex-col">
              <h2 className="text-22 text-ink font-medium">{dict.info.faqTitle}</h2>
              <Accordion
                className="mt-3 border-b"
                items={dict.info.faq.map((item, i) => ({
                  id: `faq-${i}`,
                  title: item.q,
                  content: item.a,
                }))}
              />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
