import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Placeholder, type Tone } from "@/components/ui/placeholder";
import { cn } from "@/lib/cn";

/** Three-panel composition: image / title card / image. Side panels appear from lg up. */
export function HeroSlide({
  title,
  text,
  cta,
  href,
  intro = false,
  tones,
  heading: Heading = "h2",
}: {
  title: string;
  text: string;
  cta: string;
  href: string;
  intro?: boolean;
  tones: readonly [Tone, Tone, Tone];
  heading?: "h1" | "h2";
}) {
  return (
    <div className="grid h-[min(46rem,calc(100svh-7rem))] min-h-[34rem] grid-cols-1 gap-3 p-3 lg:grid-cols-[1fr_1.08fr_1fr]">
      <Placeholder tone={tones[0]} caption className="hidden h-full lg:flex" />
      <div className="bg-sand flex h-full flex-col">
        <Placeholder tone={tones[1]} caption className="min-h-0 flex-1" />
        <div
          className={cn(
            "flex flex-col items-center px-6 pt-8 pb-14 text-center",
            intro && "hero-intro",
          )}
        >
          <Heading className="font-serif text-[clamp(2.75rem,6.2vw,5.5rem)] leading-[0.95] font-light tracking-[0.04em] uppercase">
            {title}
          </Heading>
          <p className="text-muted mt-4 max-w-sm text-balance">{text}</p>
          <Button asChild variant="light" size="md" className="mt-6">
            <Link href={href}>{cta}</Link>
          </Button>
        </div>
      </div>
      <Placeholder tone={tones[2]} caption className="hidden h-full lg:flex" />
    </div>
  );
}
