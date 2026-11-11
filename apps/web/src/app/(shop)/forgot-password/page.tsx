import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ForgotPasswordView } from "@/components/shop/password-views";
import { getFeatures } from "@/lib/features";

export const metadata: Metadata = { robots: { index: false } };

export default function ForgotPasswordPage() {
  if (!getFeatures().accounts) notFound(); // accounts module is switched off
  return <ForgotPasswordView />;
}
