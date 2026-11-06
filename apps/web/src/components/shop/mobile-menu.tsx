"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ru } from "@/content/ru";
import type { CategoryOut } from "@/lib/api/types";
import { cn } from "@/lib/cn";

/** Drawer for small screens. Same path in and out; the scrim fades with it. */
export function MobileMenu({ categories }: { categories: CategoryOut[] }) {
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    closeBtn.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const row = "block py-3 text-[0.8rem] tracking-[0.14em] uppercase";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={ru.nav.menu}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="hover:bg-sand grid size-10 place-items-center"
      >
        <Menu className="size-5" strokeWidth={1.4} aria-hidden="true" />
      </button>

      <div className={cn("fixed inset-0 z-50", !open && "pointer-events-none")} aria-hidden={!open}>
        <div
          onClick={close}
          className={cn(
            "bg-deep/50 absolute inset-0 transition-opacity duration-300 ease-out",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <nav
          aria-label={ru.nav.mainNav}
          inert={!open}
          className={cn(
            "bg-paper absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto px-6 py-4 transition-transform duration-300 ease-[var(--ease-drawer)]",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            ref={closeBtn}
            type="button"
            aria-label={ru.nav.closeMenu}
            onClick={close}
            className="hover:bg-sand -ml-2 grid size-10 place-items-center"
          >
            <X className="size-5" strokeWidth={1.4} aria-hidden="true" />
          </button>

          <p className="mt-6 font-serif text-3xl">{ru.nav.jewelry}</p>
          <ul className="border-line mt-2 divide-y border-y">
            <li>
              <Link href="/catalog" onClick={close} className={row}>
                {ru.nav.allJewelry}
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog/${c.slug}`} onClick={close} className={row}>
                  {c.name}
                </Link>
                {c.children.length > 0 && (
                  <ul className="mb-2 ml-4">
                    {c.children.map((ch) => (
                      <li key={ch.slug}>
                        <Link
                          href={`/catalog/${ch.slug}`}
                          onClick={close}
                          className="text-muted block py-2 text-sm"
                        >
                          {ch.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <ul className="mt-4">
            {ru.nav.collectionLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className={row}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/stores" onClick={close} className={row}>
                {ru.nav.stores}
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={close} className={row}>
                {ru.nav.about}
              </Link>
            </li>
            <li>
              <Link href="/delivery" onClick={close} className={row}>
                {ru.nav.delivery}
              </Link>
            </li>
            <li>
              <Link href="/contacts" onClick={close} className={row}>
                {ru.nav.contacts}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
