import { cn } from "@/lib/cn";

/** Grey stand-in for photography, with the wireframe's small caption. Decorative. */
export function PhotoPlaceholder({ label, className }: { label?: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-placeholder text-12 text-muted flex items-center justify-center overflow-hidden text-center",
        className,
      )}
    >
      {label}
    </div>
  );
}
