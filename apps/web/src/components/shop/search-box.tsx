"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ru } from "@/content/ru";
import { cn } from "@/lib/cn";

/** Search icon that opens a bar under the header. Plain GET form to the catalog. */
export function SearchBox() {
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={ru.nav.search}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="hover:bg-sand grid size-10 place-items-center transition-colors duration-150"
      >
        <Search className="size-5" strokeWidth={1.4} aria-hidden="true" />
      </button>
      <div
        inert={!open}
        className={cn(
          "bg-paper border-line absolute inset-x-0 top-full border-b transition-[opacity,transform,visibility] ease-out",
          open
            ? "visible translate-y-0 opacity-100 duration-200"
            : "invisible -translate-y-1 opacity-0 duration-150",
        )}
      >
        <form
          method="get"
          action="/catalog"
          role="search"
          aria-label={ru.search.label}
          className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5"
        >
          <input
            ref={input}
            name="q"
            type="search"
            placeholder={ru.search.placeholder}
            aria-label={ru.search.label}
            className="border-line placeholder:text-muted focus:border-ink h-12 min-w-0 flex-1 border-b bg-transparent font-serif text-2xl outline-none"
          />
          <button
            type="submit"
            className="text-xs tracking-[0.16em] uppercase transition-transform duration-150 active:scale-[0.97]"
          >
            {ru.search.submit}
          </button>
          <button
            type="button"
            aria-label={ru.search.close}
            onClick={() => setOpen(false)}
            className="hover:bg-sand grid size-10 place-items-center"
          >
            <X className="size-5" strokeWidth={1.4} aria-hidden="true" />
          </button>
        </form>
      </div>
    </>
  );
}
