"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ru } from "@/content/ru";
import { cn } from "@/lib/cn";

/** Full-width slides with arrows and dots. No autoplay: nothing moves unless the visitor asks. */
export function HeroCarousel({ slides }: { slides: React.ReactNode[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            setActive(Number((e.target as HTMLElement).dataset.index));
          }
        }
      },
      { root: el, threshold: [0.6] },
    );
    el.querySelectorAll("[data-index]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    el.scrollTo({ left: i * el.clientWidth, behavior });
  }, []);

  const last = slides.length - 1;
  const arrow =
    "bg-paper hover:bg-white absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center shadow-[0_4px_14px_-6px_rgba(18,26,46,0.35)] transition-[background-color,transform] duration-150 active:scale-95 md:grid";

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={ru.home.heroLabel}
      className="bg-sand relative"
    >
      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto motion-reduce:scroll-auto"
      >
        {slides.map((slide, i) => (
          <div key={i} data-index={i} inert={i !== active} className="w-full shrink-0 snap-center">
            {slide}
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label={ru.home.heroPrev}
        onClick={() => goTo(Math.max(0, active - 1))}
        className={cn(arrow, "left-5", active === 0 && "pointer-events-none opacity-0")}
      >
        <ArrowLeft className="size-5" strokeWidth={1.4} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={ru.home.heroNext}
        onClick={() => goTo(Math.min(last, active + 1))}
        className={cn(arrow, "right-5", active === last && "pointer-events-none opacity-0")}
      >
        <ArrowRight className="size-5" strokeWidth={1.4} aria-hidden="true" />
      </button>

      <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={ru.home.heroGoTo(i + 1)}
            aria-current={i === active}
            onClick={() => goTo(i)}
            className="group grid h-6 w-10 place-items-center"
          >
            <span
              className={cn(
                "h-px w-full transition-[background-color,height] duration-300 ease-out",
                i === active ? "bg-ink h-0.5" : "bg-ink/30 group-hover:bg-ink/60",
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
