"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

/**
 * Native scroll-snap carousel. The browser owns the physics, so it is interruptible, takes
 * swipes and trackpads for free, and needs no animation library.
 */
export function Carousel({
  children,
  label,
  prevLabel,
  nextLabel,
  className,
}: {
  children: React.ReactNode;
  label: string;
  prevLabel: string;
  nextLabel: string;
  className?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: scrollBehavior() });
  };

  const arrow =
    "bg-paper text-ink hover:bg-white absolute top-[38%] z-10 hidden size-11 place-items-center shadow-[0_4px_14px_-6px_rgba(18,26,46,0.35)] transition-[opacity,background-color,transform] duration-200 ease-out active:scale-95 md:grid";

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <ul
        ref={track}
        onScroll={measure}
        tabIndex={0}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 motion-reduce:scroll-auto md:mx-0 md:px-0"
      >
        {children}
      </ul>
      <button
        type="button"
        aria-label={prevLabel}
        onClick={() => go(-1)}
        disabled={edges.start}
        className={cn(arrow, "left-3", edges.start && "pointer-events-none opacity-0")}
      >
        <ArrowLeft className="size-5" strokeWidth={1.4} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        onClick={() => go(1)}
        disabled={edges.end}
        className={cn(arrow, "right-3", edges.end && "pointer-events-none opacity-0")}
      >
        <ArrowRight className="size-5" strokeWidth={1.4} aria-hidden="true" />
      </button>
    </div>
  );
}
