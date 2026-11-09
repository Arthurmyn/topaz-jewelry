import Link from "next/link";

/** Centered heading with an optional subtitle and "see all" link. */
export function SectionHeading({
  title,
  subtitle,
  linkLabel,
  href,
}: {
  title: string;
  subtitle?: string;
  linkLabel?: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h2 className="text-28 md:text-32 text-ink font-medium">{title}</h2>
      {subtitle && <p className="text-16 text-muted">{subtitle}</p>}
      {linkLabel && href && (
        <Link href={href} className="text-13 text-ink font-medium underline underline-offset-2">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
