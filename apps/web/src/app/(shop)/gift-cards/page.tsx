import type { Metadata } from "next";
import { GiftCardForm } from "@/components/shop/gift-card-form";
import { PageIntro } from "@/components/shop/page-intro";
import { getDict } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return { title: dict.giftCards.title, alternates: { canonical: "/gift-cards" } };
}

export default async function GiftCardsPage() {
  const dict = await getDict();
  const g = dict.giftCards;
  return (
    <>
      <PageIntro
        crumbs={[{ label: dict.common.home, href: "/" }, { label: g.breadcrumb }]}
        title={g.title}
        subtitle={g.subtitle}
      />
      <GiftCardForm />
    </>
  );
}
