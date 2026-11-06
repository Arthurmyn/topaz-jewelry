import { ru } from "@/content/ru";

export function PromoBar() {
  return (
    <div className="bg-deep text-deep-text flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 px-4 py-3 text-center text-xs tracking-[0.12em]">
      <span>{ru.promo[0]}</span>
      <span aria-hidden="true" className="bg-deep-text/40 hidden h-3 w-px sm:block" />
      <span>{ru.promo[1]}</span>
    </div>
  );
}
