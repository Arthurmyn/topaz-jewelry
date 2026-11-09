"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/text";

export type HeroSlide = {
  eyebrow: string;
  title: string;
  text: string;
  cta: string;
  href: string;
};

/** Wireframe hero: 640px band, copy bottom-left, three slider dots. No autoplay. */
export function HeroSlider({
  slides,
  photoLabel,
  label,
  goToLabel,
}: {
  slides: HeroSlide[];
  photoLabel: string;
  label: string;
  goToLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="bg-placeholder relative h-[480px] w-full md:h-[640px]"
    >
      <p
        aria-hidden="true"
        className="text-12 text-muted absolute top-8 right-[130px] max-lg:hidden"
      >
        {photoLabel}
      </p>
      <div className="px-page mx-auto flex h-full w-full max-w-[1440px] flex-col items-start justify-end gap-5 py-12 md:py-20">
        <div
          key={index}
          className="motion-safe:animate-fade-in flex flex-col items-start gap-5"
          aria-live="polite"
        >
          <p className="text-12 text-ink tracking-eyebrow font-medium uppercase">{slide.eyebrow}</p>
          <h1 className="text-36 md:text-56 text-ink font-medium md:leading-[64px]">
            {slide.title}
          </h1>
          <p className="text-16 md:text-18 text-muted">{slide.text}</p>
          <Button asChild>
            <Link href={slide.href}>{slide.cta}</Link>
          </Button>
        </div>
        <div className="flex gap-2 pt-3">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={fmt(goToLabel, { n: i + 1 })}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`bg-ink relative size-2 rounded-[4px] transition-opacity duration-150 after:absolute after:-inset-2 after:content-[''] ${i === index ? "opacity-100" : "opacity-35"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
