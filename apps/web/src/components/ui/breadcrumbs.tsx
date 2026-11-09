import Link from "next/link";
import { Fragment } from "react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, label }: { items: Crumb[]; label?: string }) {
  return (
    <nav aria-label={label ?? "Breadcrumbs"} className="px-page pt-6 pb-2">
      <ol className="text-13 mx-auto flex max-w-[1440px] flex-wrap gap-2">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={`${item.label}-${i}`}>
              <li
                className={last ? "text-ink" : "text-muted"}
                aria-current={last ? "page" : undefined}
              >
                {item.href && !last ? (
                  <Link href={item.href} className="hover:text-ink">
                    {item.label}
                  </Link>
                ) : (
                  item.label
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="text-muted">
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
