import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ru } from "@/content/ru";

type Params = Promise<{ page: string }>;
type InfoSlug = keyof typeof ru.pages;

// Info pages are static copy from content/ru.ts for now; they move to the CMS (pages table) later.
export const dynamicParams = false;
export function generateStaticParams() {
  return (Object.keys(ru.pages) as InfoSlug[]).map((page) => ({ page }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const slug = (await params).page as InfoSlug;
  const page = ru.pages[slug];
  return page ? { title: page.title, alternates: { canonical: `/${slug}` } } : {};
}

export default async function InfoPage({ params }: { params: Params }) {
  const page = ru.pages[(await params).page as InfoSlug];
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl">{page.title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed">
        {page.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}
