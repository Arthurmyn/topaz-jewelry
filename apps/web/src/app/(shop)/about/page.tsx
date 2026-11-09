import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Section } from "@/components/ui/section";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.about.title, alternates: { canonical: "/about" } };
}

export default async function AboutPage() {
  const dict = await getDict();
  const a = dict.about;

  return (
    <>
      <Breadcrumbs items={[{ label: dict.common.home, href: "/" }, { label: a.breadcrumb }]} />
      <div className="px-page flex flex-col gap-2.5 py-5">
        <h1 className="text-32 md:text-40 text-ink font-medium">{a.title}</h1>
        <p className="text-16 text-muted">{a.subtitle}</p>
      </div>

      <Section innerClassName="pt-4 pb-16">
        <PhotoPlaceholder label={a.heroPhoto} className="h-[260px] w-full md:h-[440px]" />
      </Section>

      <Section innerClassName="flex flex-col gap-6 pb-[72px] lg:flex-row lg:gap-20">
        <h2 className="text-24 md:text-28 text-ink min-w-0 flex-1 font-medium">
          {a.history.title}
        </h2>
        <div className="text-16 text-muted flex min-w-0 flex-1 flex-col gap-4 leading-[26px]">
          {a.history.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      </Section>

      <Section innerClassName="pb-[72px]">
        <ul className="grid gap-6 md:grid-cols-3">
          {a.values.map((v) => (
            <li key={v.title} className="border-border flex flex-col gap-3 border px-7 py-8">
              <p className="text-18 text-ink font-medium">{v.title}</p>
              <p className="text-14 text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section innerClassName="flex flex-col gap-10 pb-24 lg:flex-row lg:items-center lg:gap-20">
        <PhotoPlaceholder
          label={a.story.photo}
          className="h-[320px] w-full lg:h-[440px] lg:w-[560px] lg:shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col items-start gap-5">
          <h2 className="text-28 md:text-32 text-ink font-medium">{a.story.title}</h2>
          <p className="text-16 text-muted leading-[26px]">{a.story.text}</p>
          <Button asChild variant="outline">
            <Link href="/catalog">{a.story.cta}</Link>
          </Button>
        </div>
      </Section>

      <Section bg="soft" innerClassName="flex flex-col items-center gap-5 py-[72px] text-center">
        <h2 className="text-28 md:text-32 text-ink font-medium">{a.cta.title}</h2>
        <p className="text-16 text-muted">{a.cta.text}</p>
        <Button asChild>
          <Link href="/stores">{a.cta.button}</Link>
        </Button>
      </Section>
    </>
  );
}
