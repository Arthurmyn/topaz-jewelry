"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = { id: string; title: string; content: React.ReactNode };

/** Rows separated by hairlines; "+" / "−" on the right, as in the wireframe. */
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
              className="flex w-full items-center justify-between gap-4 py-[18px] text-left"
            >
              <span className={cn("text-15 text-ink font-medium", titleClassName)}>
                {item.title}
              </span>
              <span aria-hidden="true" className="text-20 text-muted shrink-0">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div id={panelId} hidden={!isOpen} className="text-14 text-muted pb-[18px] leading-6">
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
