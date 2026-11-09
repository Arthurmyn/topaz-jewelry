import { cn } from "@/lib/cn";

/**
 * 16px square: white with a muted border; checked = solid dark square (as in the wireframe).
 * A real (visually hidden) input keeps keyboard and screen-reader behavior.
 */
export function Checkbox({
  label,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: React.ReactNode }) {
  return (
    <label className={cn("text-14 text-ink flex cursor-pointer items-center gap-2.5", className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="border-muted peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline-ink size-4 shrink-0 border bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
      />
      <span>{label}</span>
    </label>
  );
}
