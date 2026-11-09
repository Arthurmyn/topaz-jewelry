"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDict } from "@/components/providers/app-providers";

/** "Поиск" text that turns into an input; Enter goes to the catalog with ?q=. */
export function HeaderSearch() {
  const dict = useDict();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-13 text-muted hover:text-ink whitespace-nowrap"
      >
        {dict.header.search}
      </button>
    );
  }

  return (
    <form
      role="search"
      aria-label={dict.header.searchLabel}
      onSubmit={(e) => {
        e.preventDefault();
        const q = input.current?.value.trim();
        setOpen(false);
        if (q) router.push(`/catalog?q=${encodeURIComponent(q)}`);
      }}
    >
      <input
        ref={input}
        type="search"
        aria-label={dict.header.searchLabel}
        placeholder={dict.header.searchPlaceholder}
        onBlur={() => !input.current?.value && setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="text-13 text-ink placeholder:text-muted border-ink w-40 border-b bg-transparent py-0.5 outline-none"
      />
    </form>
  );
}
