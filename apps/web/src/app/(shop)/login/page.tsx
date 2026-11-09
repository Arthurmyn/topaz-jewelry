import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthView } from "@/components/shop/auth-view";
import { getFeatures } from "@/lib/features";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.auth.breadcrumb, robots: { index: false } };
}

export default function LoginPage() {
  if (!getFeatures().accounts) notFound(); // accounts module is switched off
  return <AuthView />;
}
