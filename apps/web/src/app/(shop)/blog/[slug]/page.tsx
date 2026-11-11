import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { PageIntro } from "@/components/shop/page-intro";
import { getDictionary } from "@/content/dictionaries";
import { formatDate } from "@/lib/format-date";
import { getDict } from "@/lib/i18n-server";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getDictionary("ru").blog.posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const dict = await getDict();
  const { slug } = await params;
  const post = dict.blog.posts.find((p) => p.slug === slug);
  return post
    ? {
        title: post.title,
        description: post.excerpt,
        alternates: { canonical: `/blog/${post.slug}` },
      }
    : {};
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const dict = await getDict();
  const { slug } = await params;
  const b = dict.blog;
  const post = b.posts.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <>
      <PageIntro
        crumbs={[
          { label: dict.common.home, href: "/" },
          { label: b.breadcrumb, href: "/blog" },
          { label: post.title },
        ]}
        title={post.title}
        subtitle={formatDate(post.date)}
      />
      <article className="px-page flex flex-col gap-8 pt-6 pb-24">
        <PhotoPlaceholder label={b.photo} className="h-[240px] w-full md:h-[420px]" />
        <div className="text-16 text-muted flex max-w-2xl flex-col gap-4 leading-[26px]">
          {post.body.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
        <Link href="/blog" className="text-14 text-ink font-medium whitespace-pre">
          {b.back}
        </Link>
      </article>
    </>
  );
}
