import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { getDictionary } from "@/content/dictionaries";
import { SITE } from "@/content/site";
import { getFeatures } from "@/lib/features";
import { getCurrency, getLocale } from "@/lib/i18n-server";
import { getRates } from "@/lib/rates";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getLocale());
  return {
    metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:8080"),
    title: { default: dict.meta.title, template: `%s | ${SITE.name}` },
    description: dict.meta.description,
    openGraph: { siteName: SITE.name, type: "website" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, currency, rates] = await Promise.all([getLocale(), getCurrency(), getRates()]);
  const value = { locale, currency, rates, dict: getDictionary(locale), features: getFeatures() };
  return (
    <html lang={locale} className={inter.variable}>
      <body>
        <AppProviders value={value}>{children}</AppProviders>
      </body>
    </html>
  );
}
