"use client";

import Link from "next/link";
import { useDict, useFeatures } from "@/components/providers/app-providers";
import { fmt } from "@/lib/text";
import { cartCount, useCartLines } from "@/lib/state/cart";
import { HEADER_NAV } from "@/lib/routes";
import { HeaderSearch } from "./header-search";
import { PreferenceSwitchers } from "./preference-switchers";

const link = "text-13 text-ink hover:text-muted whitespace-nowrap";

/** Wireframe header: search + language/currency on the left, logo, account links and cart on the right. */
export function Header() {
  const dict = useDict();
  const { accounts } = useFeatures();
  const count = cartCount(useCartLines());

  return (
    <header className="border-border border-b bg-white">
      <div className="px-header flex items-center py-[22px]">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <HeaderSearch />
          <div className="max-md:hidden">
            <PreferenceSwitchers />
          </div>
        </div>
        <div className="flex flex-1 justify-center">
          <Link
            href="/"
            aria-label="Topaz Jewelry"
            className="text-28 text-ink tracking-logo font-medium"
          >
            TOPAZ
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-6">
          <Link href="/favorites" className={`${link} max-md:hidden`}>
            {dict.header.favorites}
          </Link>
          {accounts && (
            <Link href="/profile" className={`${link} max-md:hidden`}>
              {dict.header.profile}
            </Link>
          )}
          <Link href="/cart" className={link}>
            {fmt(dict.header.cart, { n: count })}
          </Link>
        </div>
      </div>
      <nav aria-label={dict.header.navLabel} className="no-scrollbar overflow-x-auto">
        <ul className="px-header text-13 text-ink mx-auto flex w-max min-w-full items-center justify-center gap-6 pt-1 pb-[18px] font-medium whitespace-nowrap lg:gap-10">
          {HEADER_NAV.map((item) => (
            <li key={item.key}>
              <Link href={item.href} className="hover:text-muted">
                {dict.header.nav[item.key]}
              </Link>
            </li>
          ))}
          <li className="md:hidden">
            <Link href="/favorites" className="hover:text-muted">
              {dict.header.favorites}
            </Link>
          </li>
          {accounts && (
            <li className="md:hidden">
              <Link href="/profile" className="hover:text-muted">
                {dict.header.profile}
              </Link>
            </li>
          )}
          <li className="md:hidden">
            <PreferenceSwitchers />
          </li>
        </ul>
      </nav>
    </header>
  );
}
