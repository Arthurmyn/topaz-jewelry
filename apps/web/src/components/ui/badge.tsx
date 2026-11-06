import { cn } from "@/lib/cn";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("bg-sand text-muted inline-block rounded-sm px-2 py-0.5 text-xs", className)}
      {...props}
    />
  );
}
