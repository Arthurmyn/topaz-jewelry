import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogView } from "@/components/shop/catalog-view";
import { CATEGORIES } from "@/content/mock/products";
import { getDict } from "@/lib/i18n-server";
import { isCategory } from "@/lib/products";

type Params = Promise<{ category: string }>;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};
  const dict = await getDict();
  return { title: dict.categories[category], alternates: { canonical: `/catalog/${category}` } };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  return (
    <Suspense>
      <CatalogView category={category} />
    </Suspense>
  );
}
