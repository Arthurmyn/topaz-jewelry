/** One filter block: title + content, hairline underneath (wireframe "Filter / ..."). */
export function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      role="group"
      aria-label={title}
      className="border-border flex w-full flex-col items-start gap-3.5 border-b pb-6"
    >
      <p className="text-14 text-ink font-medium whitespace-nowrap">{title}</p>
      {children}
    </div>
  );
}
