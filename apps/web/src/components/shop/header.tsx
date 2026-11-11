"use client";

import Link from "next/link";
import { useDict, useFeatures } from "@/components/providers/app-providers";
import { fmt } from "@/lib/text";
import { cartCount, useCartLines } from "@/lib/state/cart";
import { HEADER_NAV } from "@/lib/routes";
import { HeaderSearch } from "./header-search";
import { MobileMenu } from "./mobile-menu";
import { PreferenceSwitchers } from "./preference-switchers";

const link = "text-13 text-ink link-grow whitespace-nowrap";

/**
 * Header: search and language/currency on the left, account links and cart on the right,
 * navigation row below. The centered logo is removed for now (the new logo is coming), so
 * the top row keeps its 78px height with `min-h`. Below 1024px the nav row becomes a drawer.
 */
export function Header() {
  const dict = useDict();
  const { accounts } = useFeatures();
  const count = cartCount(useCartLines());

  return (
    <header className="border-border border-b bg-white">
      <div className="px-header flex min-h-[78px] items-center justify-between gap-6 py-[22px]">
        <div className="flex min-w-0 items-center gap-6">
          <MobileMenu />
          <div className="max-lg:hidden">
            <HeaderSearch />
          </div>
          <div className="max-lg:hidden">
            <PreferenceSwitchers />
          </div>
        </div>
        <div className="flex items-center justify-end gap-6">
          <Link href="/favorites" className={`${link} max-lg:hidden`}>
            {dict.header.favorites}
          </Link>
          {accounts && (
            <Link href="/profile" className={`${link} max-lg:hidden`}>
              {dict.header.profile}
            </Link>
          )}
          <Link href="/cart" className={link}>
            {fmt(dict.header.cart, { n: count })}
          </Link>
        </div>
      </div>
      <nav aria-label={dict.header.navLabel} className="max-lg:hidden">
        <ul className="px-header text-13 text-ink mx-auto flex items-center justify-center gap-10 pt-1 pb-[18px] font-medium whitespace-nowrap">
          {HEADER_NAV.map((item) => (
            <li key={item.key}>
              <Link href={item.href} className="link-grow">
                {dict.header.nav[item.key]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
