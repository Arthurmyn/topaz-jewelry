"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type DropdownOption<T extends string> = { value: T; label: string };

/**
 * Small listbox dropdown (language, currency, sort). Click outside or Esc closes;
 * Up/Down/Home/End move, Enter or click selects.
 *
 * Motion: the list stays mounted and toggles state classes, so opening and closing are both
 * transitions (interruptible, symmetric). It grows from the trigger corner (origin-aware);
 * closing is faster than opening.
 */
export function Dropdown<T extends string>({
  label,
  options,
  value,
  onChange,
  trigger,
  align = "left",
  triggerClassName,
}: {
  /** Accessible name of the control. */
  label: string;
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Visible trigger content (the caret is added automatically). */
  trigger: React.ReactNode;
  align?: "left" | "right";
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const listId = useId();

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const selected = options.findIndex((o) => o.value === value);
    items.current[selected >= 0 ? selected : 0]?.focus();
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open, options, value]);

  function onKeyDown(e: React.KeyboardEvent) {
    const current = items.current.findIndex((el) => el === document.activeElement);
    const focusAt = (i: number) => items.current[(i + options.length) % options.length]?.focus();
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      focusAt(current + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusAt(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusAt(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusAt(options.length - 1);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={root} className="relative" onKeyDown={open ? onKeyDown : undefined}>
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn("press flex items-center gap-1.5", triggerClassName)}
      >
        {trigger}
        <span
          aria-hidden="true"
          className={cn(
            "text-muted inline-block transition-transform duration-200 ease-out motion-reduce:transition-none",
            open && "rotate-180",
          )}
        >
          ▾
        </span>
      </button>
      <ul
        id={listId}
        role="listbox"
        aria-label={label}
        inert={!open}
        className={cn(
          "border-border absolute top-full z-50 mt-2 min-w-full border bg-white py-1 whitespace-nowrap shadow-[0_8px_24px_rgba(26,26,26,0.08)]",
          "transition-[opacity,transform,visibility] ease-out",
          align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
          open
            ? "visible scale-100 opacity-100 duration-150"
            : "invisible scale-[0.97] opacity-0 duration-100 motion-reduce:scale-100",
        )}
      >
        {options.map((option, i) => (
          <li key={option.value} role="presentation">
            <button
              ref={(el) => {
                items.current[i] = el;
              }}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                close(true);
              }}
              className={cn(
                "text-13 hover:bg-soft w-full px-4 py-2.5 text-left transition-colors duration-100",
                option.value === value ? "text-ink font-medium" : "text-muted",
              )}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
