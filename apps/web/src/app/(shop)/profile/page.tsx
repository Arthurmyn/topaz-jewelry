import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileView } from "@/components/shop/profile-view";
import { getFeatures } from "@/lib/features";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.profile.title, robots: { index: false } };
}

export default function ProfilePage() {
  if (!getFeatures().accounts) notFound(); // accounts module is switched off
  return <ProfileView />;
}
