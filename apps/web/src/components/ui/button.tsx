import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "./slot";
import { cn } from "@/lib/cn";

/**
 * Wireframe buttons: square, 13px medium caps with 0.52px tracking.
 * `dark`, `outline`, `light` come from the wireframe. `ghost` and `danger` exist only for the admin panel.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center text-13 font-medium uppercase tracking-button transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        dark: "bg-ink text-white hover:bg-dark",
        outline: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
        light: "bg-white text-ink hover:bg-soft",
        ghost: "text-ink hover:bg-soft",
        danger: "bg-error text-white hover:opacity-90",
      },
      size: { sm: "h-8 px-3", md: "px-7 py-3.5", lg: "px-10 py-4" },
    },
    defaultVariants: { variant: "dark", size: "md" },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
