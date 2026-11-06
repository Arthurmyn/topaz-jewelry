import Link from "next/link";
import { ru } from "@/content/ru";
import { cn } from "@/lib/cn";

export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={ru.site.name}
      className={cn("inline-flex flex-col items-center leading-none", className)}
    >
      <span
        className={cn(
          "pl-[0.34em] font-serif text-[1.7rem] font-medium tracking-[0.34em]",
          light ? "text-deep-text" : "text-ink",
        )}
      >
        {ru.site.wordmark}
      </span>
      <span
        className={cn(
          "mt-1 pl-[0.62em] text-[0.55rem] tracking-[0.62em]",
          light ? "text-deep-muted" : "text-muted",
        )}
      >
        {ru.site.wordmarkSub}
      </span>
    </Link>
  );
}
