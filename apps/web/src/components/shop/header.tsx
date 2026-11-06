import Link from "next/link";
import { Heart, User } from "lucide-react";
import { ru } from "@/content/ru";
import { getConfig } from "@/lib/features";

export async function Header() {
  const { features } = await getConfig();
  return (
    <header className="border-line bg-paper/95 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="font-serif text-2xl tracking-wide">
          {ru.site.name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/catalog" className="hover:text-gold-dark">
            {ru.nav.catalog}
          </Link>
          <Link href="/stores" className="hover:text-gold-dark">
            {ru.nav.stores}
          </Link>
          <Link href="/about" className="hover:text-gold-dark">
            {ru.nav.about}
          </Link>
          <Link href="/delivery" className="hover:text-gold-dark">
            {ru.nav.delivery}
          </Link>
          <Link href="/contacts" className="hover:text-gold-dark">
            {ru.nav.contacts}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {features.accounts && (
            <>
              <Link href="/account/favorites" aria-label={ru.nav.favorites}>
                <Heart className="size-5" />
              </Link>
              <Link href="/account" aria-label={ru.nav.account}>
                <User className="size-5" />
              </Link>
            </>
          )}
        </div>
      </div>
      <nav className="border-line flex gap-5 overflow-x-auto border-t px-4 py-2 text-sm md:hidden">
        <Link href="/catalog">{ru.nav.catalog}</Link>
        <Link href="/stores">{ru.nav.stores}</Link>
        <Link href="/about">{ru.nav.about}</Link>
        <Link href="/delivery">{ru.nav.delivery}</Link>
        <Link href="/contacts">{ru.nav.contacts}</Link>
      </nav>
    </header>
  );
}
