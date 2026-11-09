import Link from "next/link";
import { cn } from "@/lib/cn";

export type SideNavItem = {
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
};

/** Vertical list with hairlines (profile and info pages). */
export function SideNav({ items, label }: { items: SideNavItem[]; label: string }) {
  const row = "text-15 border-border block w-full border-b py-3.5 text-left";
  return (
    <nav aria-label={label} className="w-full lg:w-[260px] lg:shrink-0">
      <ul>
        {items.map((item) => {
          const cls = cn(row, item.active ? "text-ink font-medium" : "text-muted hover:text-ink");
          return (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={item.onClick}
                  aria-current={item.active ? "page" : undefined}
                  className={cls}
                >
                  {item.label}
                </Link>
              ) : (
                <button type="button" onClick={item.onClick} className={cls}>
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
