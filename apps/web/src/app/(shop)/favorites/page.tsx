import type { Metadata } from "next";
import { FavoritesView } from "@/components/shop/favorites-view";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.favorites.title, robots: { index: false } };
}

export default function FavoritesPage() {
  return <FavoritesView />;
}
