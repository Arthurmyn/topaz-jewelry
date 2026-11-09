import { cn } from "@/lib/cn";

/**
 * Grey stand-in for photography, with the wireframe's small caption. Decorative.
 * `zoom` clips the picture and lets it grow slightly while a parent with the `group` class is hovered
 * (hover-capable pointers only; off under prefers-reduced-motion).
 */
export function PhotoPlaceholder({
  label,
  className,
  zoom = false,
}: {
  label?: string;
  className?: string;
  zoom?: boolean;
}) {
  const inner =
    "bg-placeholder text-12 text-muted flex items-center justify-center overflow-hidden text-center";
  if (!zoom) {
    return (
      <div aria-hidden="true" className={cn(inner, className)}>
        {label}
      </div>
    );
  }
  return (
    <div aria-hidden="true" className={cn("overflow-hidden", className)}>
      <div
        className={cn(
          inner,
          "size-full transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
        )}
      >
        {label}
      </div>
    </div>
  );
}
