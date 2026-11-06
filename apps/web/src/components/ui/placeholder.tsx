import { ru } from "@/content/ru";
import { cn } from "@/lib/cn";

const TONES = {
  a: "bg-sand",
  b: "bg-sand-deep",
  c: "bg-[#e6e1d3]",
  d: "bg-[#d9d3c3]",
} as const;

export type Tone = keyof typeof TONES;

/** Neutral stand-in for photography. Decorative: hidden from assistive tech. */
export function Placeholder({
  tone = "a",
  caption = false,
  className,
}: {
  tone?: Tone;
  caption?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "text-ink/20 relative flex items-center justify-center overflow-hidden",
        TONES[tone],
        className,
      )}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        className="w-1/4 max-w-24 min-w-10"
      >
        <path d="M18 14h28l12 14-26 28L6 28z" />
        <path d="M6 28h52M18 14l14 14 14-14M32 28v28M18 14l6 14 8 28M46 14l-6 14-8 28" />
      </svg>
      {caption && (
        <span className="text-ink/40 absolute bottom-3 left-4 text-[0.65rem] tracking-[0.18em] uppercase">
          {ru.placeholder.label}
        </span>
      )}
    </div>
  );
}
