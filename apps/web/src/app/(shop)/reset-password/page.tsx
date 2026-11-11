import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResetPasswordView } from "@/components/shop/password-views";
import { getFeatures } from "@/lib/features";

export const metadata: Metadata = { robots: { index: false } };

export default function ResetPasswordPage() {
  if (!getFeatures().accounts) notFound(); // accounts module is switched off
  return (
    <Suspense>
      <ResetPasswordView />
    </Suspense>
  );
}
