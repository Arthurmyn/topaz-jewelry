import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "./slot";
import { cn } from "@/lib/cn";

// Square, tracked-out capitals. Press feedback is instant and interruptible (transform transition).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.16em] transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ink text-paper hover:bg-deep",
        light: "bg-paper text-ink hover:bg-white",
        outline: "border border-ink/30 text-ink hover:border-ink",
        ghost: "hover:bg-sand",
        danger: "bg-red-700 text-white hover:bg-red-800",
      },
      size: { sm: "h-8 px-3", md: "h-11 px-6", lg: "h-14 px-10" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
