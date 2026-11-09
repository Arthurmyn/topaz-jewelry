import { cn } from "@/lib/cn";

/** 18px circle: white with a muted border; selected = solid dark (matches the wireframe SVG). */
export function Radio({
  title,
  hint,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "title"> & {
  title: string;
  hint?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input type="radio" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="border-muted peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline-ink size-[18px] shrink-0 rounded-full border bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
      />
      <span className="flex flex-col gap-1">
        <span className="text-15 text-ink font-medium">{title}</span>
        {hint && <span className="text-13 text-muted">{hint}</span>}
      </span>
    </label>
  );
}
