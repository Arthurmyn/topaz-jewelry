"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ru } from "@/content/ru";
import type { CategoryOut } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { Placeholder } from "@/components/ui/placeholder";

const linkClass =
  "relative inline-flex h-16 items-center text-[0.8rem] tracking-[0.14em] uppercase transition-colors duration-150 hover:text-gold-dark after:absolute after:inset-x-0 after:bottom-4 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100";

/** Centered primary navigation. "Украшения" opens a full-width mega-menu. */
export function MainNav({ categories }: { categories: CategoryOut[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, close]);

  // Roots with children get their own column; the rest share one list.
  const withChildren = categories.filter((c) => c.children.length > 0);
  const simple = categories.filter((c) => c.children.length === 0);

  return (
    <div ref={root} className="hidden lg:block">
      <nav aria-label={ru.nav.mainNav} className="flex items-center gap-9">
        <div
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") {
              cancelClose();
              setOpen(true);
            }
          }}
          onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
        >
          <button
            type="button"
            className={cn(linkClass, "gap-1.5")}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {ru.nav.jewelry}
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200 ease-out",
                open && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        </div>
        <Link href="/catalog/obruchalnye-koltsa" className={linkClass} onClick={close}>
          {ru.nav.wedding}
        </Link>
        <Link href="/catalog?price_max=100000" className={linkClass} onClick={close}>
          {ru.nav.gifts}
        </Link>
        <Link href="/stores" className={linkClass} onClick={close}>
          {ru.nav.stores}
        </Link>
        <Link href="/about" className={linkClass} onClick={close}>
          {ru.nav.about}
        </Link>
      </nav>

      {/* Panel: transition (not keyframes) so a quick re-hover reverses from the current frame. */}
      <div
        id={panelId}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") cancelClose();
        }}
        onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) scheduleClose();
        }}
        inert={!open}
        className={cn(
          "bg-paper border-line absolute inset-x-0 top-full origin-top border-b shadow-[0_18px_30px_-24px_rgba(18,26,46,0.35)]",
          "transition-[opacity,transform,visibility] ease-out",
          open
            ? "visible translate-y-0 opacity-100 duration-200"
            : "invisible -translate-y-1 opacity-0 duration-150",
        )}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-12 gap-8 px-8 py-10">
          <div className="col-span-8 grid grid-cols-3 gap-8">
            {withChildren.map((c) => (
              <div key={c.slug}>
                <Link
                  href={`/catalog/${c.slug}`}
                  onClick={close}
                  className="hover:text-gold-dark font-serif text-2xl"
                >
                  {c.name}
                </Link>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {c.children.map((ch) => (
                    <li key={ch.slug}>
                      <Link
                        href={`/catalog/${ch.slug}`}
                        onClick={close}
                        className="text-muted hover:text-ink transition-colors duration-150"
                      >
                        {ch.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <Link
                href="/catalog"
                onClick={close}
                className="hover:text-gold-dark font-serif text-2xl"
              >
                {ru.nav.allJewelry}
              </Link>
              <ul className="mt-4 space-y-2.5 text-sm">
                {simple.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/catalog/${c.slug}`}
                      onClick={close}
                      className="text-muted hover:text-ink transition-colors duration-150"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-serif text-2xl">{ru.nav.collections}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {ru.nav.collectionLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={close}
                      className="text-muted hover:text-ink transition-colors duration-150"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link
            href="/catalog?sort=newest"
            onClick={close}
            className="col-span-4 block"
            tabIndex={open ? 0 : -1}
          >
            <Placeholder tone="b" caption className="aspect-[16/9] w-full" />
          </Link>
        </div>
      </div>
    </div>
  );
}
