import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";

/** Breadcrumbs + page title block used by simple content pages. */
export function PageIntro({
  crumbs,
  title,
  subtitle,
}: {
  crumbs: Crumb[];
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <div className="px-page flex flex-col gap-2.5 py-5">
        <h1 className="text-32 md:text-40 text-ink font-medium">{title}</h1>
        {subtitle && <p className="text-16 text-muted">{subtitle}</p>}
      </div>
    </>
  );
}

/** Centered result block (success, error, empty) with optional actions. */
export function ResultBlock({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="px-page flex flex-col items-start gap-5 pt-6 pb-24">
      <h2 className="text-28 md:text-32 text-ink font-medium">{title}</h2>
      {text && (
        <p role="status" className="text-16 text-muted max-w-xl">
          {text}
        </p>
      )}
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}
