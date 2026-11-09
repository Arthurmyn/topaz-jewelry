import { cn } from "@/lib/cn";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  decreaseLabel,
  increaseLabel,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
  className?: string;
}) {
  const cell = "text-14 text-ink flex items-center justify-center px-4 py-2.5 font-medium";
  return (
    <div className={cn("border-border flex items-center border", className)}>
      <button
        type="button"
        aria-label={decreaseLabel}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={cn(cell, "hover:bg-soft disabled:opacity-40")}
      >
        –
      </button>
      <span className={cell} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={cn(cell, "hover:bg-soft disabled:opacity-40")}
      >
        +
      </button>
    </div>
  );
}
