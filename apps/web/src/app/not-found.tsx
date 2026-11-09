import Link from "next/link";
import { AnnouncementBar } from "@/components/shop/announcement-bar";
import { Footer } from "@/components/shop/footer";
import { Header } from "@/components/shop/header";
import { Button } from "@/components/ui/button";
import { getDict } from "@/lib/i18n-server";

export default async function NotFound() {
  const dict = await getDict();
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-32 text-ink font-medium">{dict.errors.notFoundTitle}</h1>
        <p className="text-16 text-muted mt-3">{dict.errors.notFoundText}</p>
        <Button asChild className="mt-8">
          <Link href="/catalog">{dict.errors.toCatalog}</Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}
