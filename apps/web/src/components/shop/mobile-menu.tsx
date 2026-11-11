"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDict, useFeatures } from "@/components/providers/app-providers";
import { cn } from "@/lib/cn";
import { HEADER_NAV } from "@/lib/routes";
import { HeaderSearch } from "./header-search";
import { PreferenceSwitchers } from "./preference-switchers";

/**
 * Navigation drawer for screens below 1024px. Slides in from the left and leaves the same way;
 * the scrim fades with it. Stays mounted (inert when closed) so both directions are transitions.
 */
export function MobileMenu() {
  const dict = useDict();
  const { accounts } = useFeatures();
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    openButton.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const row = "text-16 text-ink border-border block border-b py-4 font-medium";

  return (
    <div className="lg:hidden">
      <button
        ref={openButton}
        type="button"
        aria-label={dict.header.menu}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="press text-13 text-ink -ml-2 flex h-10 items-center gap-2 px-2"
      >
        <span aria-hidden="true" className="flex w-5 flex-col gap-1">
          <span className="bg-ink block h-px" />
          <span className="bg-ink block h-px" />
          <span className="bg-ink block h-px" />
        </span>
        <span className="max-sm:sr-only">{dict.header.menu}</span>
      </button>

      <div className={cn("fixed inset-0 z-[60]", !open && "pointer-events-none")}>
        <div
          onClick={close}
          aria-hidden="true"
          className={cn(
            "bg-ink/40 absolute inset-0 transition-opacity duration-300 ease-out",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <nav
          aria-label={dict.header.navLabel}
          inert={!open}
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col overflow-y-auto bg-white px-6 pt-4 pb-8 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            ref={closeButton}
            type="button"
            aria-label={dict.header.closeMenu}
            onClick={close}
            className="press text-20 -ml-2 flex size-10 items-center justify-center self-start"
          >
            ✕
          </button>
          <div className="border-border border-b py-5">
            <HeaderSearch />
          </div>
          <ul className="mt-2">
            {HEADER_NAV.map((item) => (
              <li key={item.key}>
                <Link href={item.href} onClick={() => setOpen(false)} className={row}>
                  {dict.header.nav[item.key]}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/favorites" onClick={() => setOpen(false)} className={row}>
                {dict.header.favorites}
              </Link>
            </li>
            {accounts && (
              <li>
                <Link href="/profile" onClick={() => setOpen(false)} className={row}>
                  {dict.header.profile}
                </Link>
              </li>
            )}
          </ul>
          <div className="mt-6">
            <PreferenceSwitchers />
          </div>
        </nav>
      </div>
    </div>
  );
}
