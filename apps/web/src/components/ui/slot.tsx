import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/cn";

/** Minimal asChild helper: merges props into the single child element (e.g. a <Link>). */
export function Slot({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  if (!isValidElement<{ className?: string }>(children)) return null;
  return cloneElement(children, {
    ...props,
    className: cn(className, children.props.className),
  } as object);
}
