import type { Metadata } from "next";
import { ru } from "@/content/ru";
import { CatalogView } from "@/components/shop/catalog-view";

export const metadata: Metadata = {
  title: ru.catalog.title,
  alternates: { canonical: "/catalog" },
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CatalogView basePath="/catalog" searchParams={await searchParams} />;
}
