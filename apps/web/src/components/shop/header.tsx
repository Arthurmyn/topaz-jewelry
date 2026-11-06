import Link from "next/link";
import { Heart, ShoppingBag, User } from "lucide-react";
import { ru } from "@/content/ru";
import { serverApi } from "@/lib/api/client";
import { getConfig } from "@/lib/features";
import { MainNav } from "./main-nav";
import { MobileMenu } from "./mobile-menu";
import { SearchBox } from "./search-box";
import { Wordmark } from "./wordmark";

const iconBtn = "hover:bg-sand grid size-10 place-items-center transition-colors duration-150";

export async function Header() {
  const [{ features }, { data: categories }] = await Promise.all([
    getConfig(),
    serverApi(300).GET("/api/v1/categories"),
  ]);
  const cats = categories ?? [];

  return (
    <header className="border-line sticky top-0 z-40 border-b">
      {/* Blur lives on its own layer: backdrop-filter on the header would trap the fixed mobile drawer. */}
      <div aria-hidden="true" className="glass absolute inset-0 -z-10" />
      <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8">
        <div className="flex items-center gap-2">
          <MobileMenu categories={cats} />
          <Wordmark className="max-lg:hidden" />
        </div>
        <MainNav categories={cats} />
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <div className="col-start-3 row-start-1 flex items-center justify-end">
          <SearchBox />
          {features.accounts && (
            <>
              <Link href="/account/favorites" aria-label={ru.nav.favorites} className={iconBtn}>
                <Heart className="size-5" strokeWidth={1.4} aria-hidden="true" />
              </Link>
              <Link href="/account" aria-label={ru.nav.account} className={iconBtn}>
                <User className="size-5" strokeWidth={1.4} aria-hidden="true" />
              </Link>
            </>
          )}
          <Link href="/cart" aria-label={ru.nav.cart} className={iconBtn}>
            <ShoppingBag className="size-5" strokeWidth={1.4} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
