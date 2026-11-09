"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = { id: string; title: string; content: React.ReactNode };

/**
 * Rows separated by hairlines; "+" / "−" on the right, as in the wireframe.
 * Motion: the panel collapses by animating grid rows (0fr to 1fr) with a fade, and the sign
 * cross-rotates. Opening takes 250ms, closing 180ms; both are transitions, so a quick re-click reverses smoothly.
 */
export function Accordion({
  items,
  titleClassName,
  className,
}: {
  items: AccordionItem[];
  titleClassName?: string;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const base = useId();
  return (
    <div className={cn("border-border flex w-full flex-col border-b", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        const panelId = `${base}-${item.id}`;
        return (
          <div key={item.id} className="border-border border-t">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : item.id)}
              className="group flex w-full items-center justify-between gap-4 py-[18px] text-left"
            >
              <span
                className={cn(
                  "text-15 text-ink group-hover:text-muted font-medium transition-colors duration-150",
                  titleClassName,
                )}
              >
                {item.title}
              </span>
              <span aria-hidden="true" className="text-20 text-muted relative h-6 w-5 shrink-0">
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-opacity",
                    isOpen ? "scale-50 rotate-90 opacity-0" : "opacity-100",
                  )}
                >
                  +
                </span>
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-opacity",
                    isOpen ? "opacity-100" : "scale-50 -rotate-90 opacity-0",
                  )}
                >
                  −
                </span>
              </span>
            </button>
            <div
              id={panelId}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows,opacity] ease-out motion-reduce:transition-opacity",
                isOpen
                  ? "grid-rows-[1fr] opacity-100 duration-[250ms]"
                  : "grid-rows-[0fr] opacity-0 duration-[180ms]",
              )}
            >
              <div className="overflow-hidden">
                <div className="text-14 text-muted pb-[18px] leading-6">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
