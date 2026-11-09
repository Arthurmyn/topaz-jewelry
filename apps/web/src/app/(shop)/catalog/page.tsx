import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/shop/catalog-view";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.catalog.all, alternates: { canonical: "/catalog" } };
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogView category={null} />
    </Suspense>
  );
}
