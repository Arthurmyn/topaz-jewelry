import { cn } from "@/lib/cn";

const control =
  "w-full border border-border bg-white px-4 text-14 text-ink placeholder:text-muted outline-none transition-colors focus:border-ink disabled:opacity-50 aria-[invalid=true]:border-error";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(control, "h-12", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 py-3.5", className)} {...props} />;
}

/** Native select styled like an input. The arrow is the wireframe's "▾" glyph. */
export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(control, "h-12 appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <span
        aria-hidden="true"
        className="text-12 text-muted pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
      >
        ▾
      </span>
    </div>
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-12 text-muted mb-1.5 block", className)} {...props} />;
}

/** Label above a control, with an optional error line. */
export function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-12 text-error mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}
