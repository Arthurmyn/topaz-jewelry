import { cn } from "@/lib/cn";

const SIZES = { sm: "px-3 py-2.5", md: "px-3.5 py-2.5", lg: "px-4 py-2.5" } as const;

/** Filter / option chip. `selected` = filled dark; `removable` adds the wireframe's "✕". */
export function Chip({
  selected = false,
  removable = false,
  size = "md",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  removable?: boolean;
  size?: keyof typeof SIZES;
}) {
  return (
    <button
      type="button"
      aria-pressed={removable ? undefined : selected}
      className={cn(
        "text-13 flex items-center justify-center border font-medium whitespace-nowrap transition-colors duration-150 disabled:opacity-40",
        SIZES[size],
        selected
          ? "border-ink bg-ink text-white"
          : "border-border text-ink hover:border-ink bg-transparent",
        className,
      )}
      {...props}
    >
      {children}
      {removable && (
        <span aria-hidden="true" className="whitespace-pre">
          {"  ✕"}
        </span>
      )}
    </button>
  );
}
