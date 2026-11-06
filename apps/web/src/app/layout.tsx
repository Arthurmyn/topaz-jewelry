import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { ru } from "@/content/ru";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:8080"),
  title: { default: `${ru.site.name} — ${ru.site.tagline}`, template: `%s | ${ru.site.name}` },
  description: ru.site.description,
  openGraph: { siteName: ru.site.name, locale: "ru_RU", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
