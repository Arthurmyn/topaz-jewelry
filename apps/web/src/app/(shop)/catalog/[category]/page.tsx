import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serverApi } from "@/lib/api/client";
import { CatalogView } from "@/components/shop/catalog-view";

type Params = Promise<{ category: string }>;

async function findCategory(slug: string) {
  const { data } = await serverApi(300).GET("/api/v1/categories");
  const flat = (data ?? []).flatMap((c) => [c, ...c.children]);
  return flat.find((c) => c.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = await findCategory((await params).category);
  if (!category) return {};
  return {
    title: category.seo_title ?? category.name,
    description: category.seo_description ?? category.description ?? undefined,
    alternates: { canonical: `/catalog/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const slug = (await params).category;
  if (!(await findCategory(slug))) notFound();
  return (
    <CatalogView category={slug} basePath={`/catalog/${slug}`} searchParams={await searchParams} />
  );
}
