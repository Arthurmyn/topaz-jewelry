import { cn } from "@/lib/cn";

/** 24px-gap grid of product cards. `columns` = columns at the widest layout. */
export function ProductGrid({
  columns = 4,
  className,
  children,
}: {
  columns?: 3 | 4;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10",
        columns === 4 ? "md:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
