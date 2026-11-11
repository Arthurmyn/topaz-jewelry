import type { Metadata } from "next";
import Link from "next/link";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { PageIntro } from "@/components/shop/page-intro";
import { formatDate } from "@/lib/format-date";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.blog.title, alternates: { canonical: "/blog" } };
}

export default async function BlogPage() {
  const dict = await getDict();
  const b = dict.blog;
  return (
    <>
      <PageIntro
        crumbs={[{ label: dict.common.home, href: "/" }, { label: b.breadcrumb }]}
        title={b.title}
        subtitle={b.subtitle}
      />
      <div className="px-page pt-6 pb-24">
        <ul className="reveal-group grid gap-x-6 gap-y-10 md:grid-cols-3">
          {b.posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="press group flex flex-col gap-3">
                <PhotoPlaceholder zoom label={b.photo} className="h-[240px] w-full md:h-[280px]" />
                <p className="text-13 text-muted">{formatDate(post.date)}</p>
                <p className="text-20 text-ink font-medium">{post.title}</p>
                <p className="text-14 text-muted">{post.excerpt}</p>
                <span className="text-13 text-ink font-medium underline underline-offset-2">
                  {b.read}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
