import { cn } from "@/lib/cn";

const BG = { white: "bg-white", soft: "bg-soft", dark: "bg-dark text-white" } as const;

/**
 * Full-width band with the wireframe's side padding. Content is capped at 1200px
 * (the 1440 frame minus 120px each side).
 */
export function Section({
  bg = "white",
  className,
  innerClassName,
  children,
  ...props
}: Omit<React.HTMLAttributes<HTMLElement>, "children"> & {
  bg?: keyof typeof BG;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("w-full", BG[bg], className)} {...props}>
      <div className={cn("px-page mx-auto w-full max-w-[1440px]", innerClassName)}>{children}</div>
    </section>
  );
}
