"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type DropdownOption<T extends string> = { value: T; label: string };

/**
 * Small listbox dropdown (language, currency, sort). Click outside or Esc closes;
 * Up/Down/Home/End move, Enter or click selects.
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
        className={cn("flex items-center gap-1.5", triggerClassName)}
      >
        {trigger}
        <span aria-hidden="true" className="text-muted">
          ▾
        </span>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className={cn(
            "border-border absolute top-full z-50 mt-2 min-w-full border bg-white py-1 whitespace-nowrap shadow-[0_8px_24px_rgba(26,26,26,0.08)]",
            align === "right" ? "right-0" : "left-0",
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
                  "text-13 hover:bg-soft w-full px-4 py-2.5 text-left",
                  option.value === value ? "text-ink font-medium" : "text-muted",
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
