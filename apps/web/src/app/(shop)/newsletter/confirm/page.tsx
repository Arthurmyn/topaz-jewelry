import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsletterConfirmView } from "@/components/shop/newsletter-pages";

export const metadata: Metadata = { robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <NewsletterConfirmView />
    </Suspense>
  );
}
