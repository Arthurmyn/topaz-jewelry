"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import { Dropdown } from "@/components/ui/dropdown";
import { Input } from "@/components/ui/input";
import { useCurrency, useDict, useMoney } from "@/components/providers/app-providers";
import {
  PRODUCTS,
  productsByCategory,
  RING_TYPES,
  STONES,
  type Category,
} from "@/content/mock/products";
import { cn } from "@/lib/cn";
import {
  availableSizes,
  filterProducts,
  hasActiveFilters,
  parseFilters,
  serializeFilters,
  toggle,
  EMPTY_FILTERS,
  type Filters,
  type SortKey,
} from "@/lib/catalog";
import { convertKzt, toKzt } from "@/lib/currency";
import { fmt, plural } from "@/lib/text";
import { useLocale } from "@/components/providers/app-providers";
import { FilterGroup } from "./filter-group";
import { ProductCard } from "./product-card";
import { ProductGrid } from "./product-grid";

const PAGE_SIZE = 9;
const CATEGORY_LIST: Category[] = ["rings", "earrings", "necklaces", "bracelets", "pendants"];

/** Catalog page body: breadcrumbs, title row, active filters, sidebar filters, results. */
export function CatalogView({ category }: { category: Category | null }) {
  const dict = useDict();
  const locale = useLocale();
  const money = useMoney();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const scope = category ? productsByCategory(category) : PRODUCTS;
  const results = useMemo(
    () => filterProducts(PRODUCTS, filters, category, dict),
    [filters, category, dict],
  );
  const sizes = availableSizes(scope);
  const c = dict.catalog;

  function update(next: Filters) {
    const qs = serializeFilters(next).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const title = category ? dict.categories[category] : c.all;
  const crumbs = [
    { label: dict.common.home, href: "/" },
    ...(category ? [{ label: c.all, href: "/catalog" }, { label: title }] : [{ label: c.all }]),
  ];

  const chips = buildChips(filters, dict, money, update);
  const resultsKey = serializeFilters(filters).toString();

  return (
    <>
      <Breadcrumbs items={crumbs} label={dict.common.home} />

      <div className="px-page flex items-center gap-4 py-5 max-sm:flex-col max-sm:items-start">
        <div className="flex flex-1 flex-col gap-1.5">
          <h1 className="text-32 md:text-40 text-ink font-medium">
            {filters.q ? fmt(c.searchResults, { q: filters.q }) : title}
          </h1>
          <p className="text-14 text-muted">{plural(c.count, results.length, locale)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? c.hideFilters : c.showFilters}
          </Button>
          <Dropdown<SortKey>
            label={fmt(c.sortLabel, { value: c.sort[filters.sort] })}
            value={filters.sort}
            onChange={(sort) => update({ ...filters, sort })}
            align="right"
            options={(["popular", "new", "priceAsc", "priceDesc"] as SortKey[]).map((k) => ({
              value: k,
              label: c.sort[k],
            }))}
            trigger={
              <span className="text-ink">{fmt(c.sortLabel, { value: c.sort[filters.sort] })}</span>
            }
            triggerClassName="border border-border px-4 py-3 text-13 gap-4"
          />
        </div>
      </div>

      {chips.length > 0 && (
        <div className="px-page flex flex-wrap items-center gap-3 pb-6">
          {chips.map((chip) => (
            <Chip
              key={chip.key}
              selected
              removable
              aria-label={fmt(c.removeFilter, { name: chip.label })}
              onClick={chip.remove}
            >
              {chip.label}
            </Chip>
          ))}
          <button
            type="button"
            onClick={() => update({ ...EMPTY_FILTERS, sort: filters.sort })}
            className="text-13 text-ink font-medium underline underline-offset-2"
          >
            {c.resetAll}
          </button>
        </div>
      )}

      <div className="px-page flex flex-col gap-12 pt-4 pb-[72px] lg:flex-row">
        <aside
          aria-label={c.showFilters}
          className={cn(
            "w-full flex-col gap-7 lg:flex lg:w-[260px] lg:shrink-0",
            filtersOpen ? "flex" : "hidden",
          )}
        >
          {(category === null || category === "rings") && (
            <FilterGroup title={c.filters.category}>
              {category === null
                ? CATEGORY_LIST.map((cat) => (
                    <Checkbox
                      key={cat}
                      label={dict.categories[cat]}
                      checked={filters.cats.includes(cat)}
                      onChange={() => update({ ...filters, cats: toggle(filters.cats, cat) })}
                    />
                  ))
                : RING_TYPES.map((type) => (
                    <Checkbox
                      key={type}
                      label={dict.ringTypes[type]}
                      checked={filters.types.includes(type)}
                      onChange={() => update({ ...filters, types: toggle(filters.types, type) })}
                    />
                  ))}
            </FilterGroup>
          )}

          <FilterGroup title={c.filters.metal}>
            {([585, 750] as const).map((purity) => (
              <Checkbox
                key={purity}
                label={dict.metals[String(purity) as "585" | "750"]}
                checked={filters.metals.includes(purity)}
                onChange={() => update({ ...filters, metals: toggle(filters.metals, purity) })}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={c.filters.stone}>
            {STONES.map((stone) => (
              <Checkbox
                key={stone}
                label={dict.stones[stone]}
                checked={filters.stones.includes(stone)}
                onChange={() => update({ ...filters, stones: toggle(filters.stones, stone) })}
              />
            ))}
          </FilterGroup>

          <FilterGroup title={c.filters.price}>
            <PriceInputs filters={filters} onChange={update} />
          </FilterGroup>

          {sizes.length > 0 && (
            <FilterGroup title={c.filters.size}>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <Chip
                    key={size}
                    size="sm"
                    selected={filters.sizes.includes(size)}
                    onClick={() => update({ ...filters, sizes: toggle(filters.sizes, size) })}
                  >
                    {size}
                  </Chip>
                ))}
              </div>
            </FilterGroup>
          )}

          <FilterGroup title={c.filters.availability}>
            <Checkbox
              label={c.availability.inStock}
              checked={filters.stock.includes("in")}
              onChange={() => update({ ...filters, stock: toggle(filters.stock, "in") })}
            />
            <Checkbox
              label={c.availability.onOrder}
              checked={filters.stock.includes("order")}
              onChange={() => update({ ...filters, stock: toggle(filters.stock, "order") })}
            />
          </FilterGroup>
        </aside>

        <Results
          key={resultsKey}
          products={results}
          hasFilters={hasActiveFilters(filters)}
          onReset={() => update(EMPTY_FILTERS)}
        />
      </div>
    </>
  );
}

/** Remounted (via key) whenever filters change, so "show more" starts from the first page again. */
function Results({
  products,
  hasFilters,
  onReset,
}: {
  products: ReturnType<typeof filterProducts>;
  hasFilters: boolean;
  onReset: () => void;
}) {
  const dict = useDict();
  const c = dict.catalog;
  const [visible, setVisible] = useState(PAGE_SIZE);

  if (products.length === 0) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3 py-16 text-center">
        <p className="text-20 text-ink font-medium">{c.empty}</p>
        <p className="text-14 text-muted">{c.emptyHint}</p>
        {hasFilters && (
          <Button variant="outline" className="mt-4" onClick={onReset}>
            {c.resetAll}
          </Button>
        )}
      </div>
    );
  }

  const shown = Math.min(visible, products.length);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-10">
      <ProductGrid columns={3}>
        {products.slice(0, shown).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </ProductGrid>
      <div className="flex flex-col items-center gap-4">
        <p className="text-13 text-muted">{fmt(c.shown, { shown, total: products.length })}</p>
        {shown < products.length && (
          <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            {c.loadMore}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Price bounds are typed in the selected currency and stored in KZT in the URL. */
function PriceInputs({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const dict = useDict();
  const { currency, rates } = useCurrency();
  const symbol = dict.currencyShort[currency];
  const shownValue = (kzt: number | null) =>
    kzt === null ? "" : String(convertKzt(kzt, currency, rates));

  function commit(field: "priceMin" | "priceMax", raw: string) {
    const trimmed = raw.trim();
    const value = trimmed === "" ? null : Number(trimmed);
    if (value !== null && (!Number.isFinite(value) || value < 0)) return;
    const kzt = value === null ? null : Math.round(toKzt(value, currency, rates));
    if (kzt === filters[field]) return;
    onChange({ ...filters, [field]: kzt });
  }

  const common = {
    type: "number" as const,
    min: 0,
    inputMode: "numeric" as const,
    className: "h-auto py-3 text-13",
  };
  const resetKey = `${filters.priceMin}-${filters.priceMax}-${currency}`;
  return (
    <div className="flex w-full gap-3" key={resetKey}>
      <Input
        {...common}
        aria-label={fmt(dict.catalog.priceFrom, { currency: symbol })}
        placeholder={fmt(dict.catalog.priceFrom, { currency: symbol })}
        defaultValue={shownValue(filters.priceMin)}
        onBlur={(e) => commit("priceMin", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
      <Input
        {...common}
        aria-label={fmt(dict.catalog.priceTo, { currency: symbol })}
        placeholder={fmt(dict.catalog.priceTo, { currency: symbol })}
        defaultValue={shownValue(filters.priceMax)}
        onBlur={(e) => commit("priceMax", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
    </div>
  );
}

function buildChips(
  f: Filters,
  dict: ReturnType<typeof useDict>,
  money: (kzt: number) => string,
  update: (f: Filters) => void,
): { key: string; label: string; remove: () => void }[] {
  const c = dict.catalog;
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (f.q)
    chips.push({
      key: "q",
      label: fmt(c.queryChip, { q: f.q }),
      remove: () => update({ ...f, q: "" }),
    });
  f.cats.forEach((v) =>
    chips.push({
      key: `cat-${v}`,
      label: dict.categories[v],
      remove: () => update({ ...f, cats: f.cats.filter((x) => x !== v) }),
    }),
  );
  f.types.forEach((v) =>
    chips.push({
      key: `type-${v}`,
      label: dict.ringTypes[v],
      remove: () => update({ ...f, types: f.types.filter((x) => x !== v) }),
    }),
  );
  f.metals.forEach((v) =>
    chips.push({
      key: `metal-${v}`,
      label: dict.metals[String(v) as "585" | "750"],
      remove: () => update({ ...f, metals: f.metals.filter((x) => x !== v) }),
    }),
  );
  f.stones.forEach((v) =>
    chips.push({
      key: `stone-${v}`,
      label: dict.stones[v],
      remove: () => update({ ...f, stones: f.stones.filter((x) => x !== v) }),
    }),
  );
  if (f.priceMin !== null)
    chips.push({
      key: "priceMin",
      label: fmt(c.priceChipFrom, { value: money(f.priceMin) }),
      remove: () => update({ ...f, priceMin: null }),
    });
  if (f.priceMax !== null)
    chips.push({
      key: "priceMax",
      label: fmt(c.priceChipTo, { value: money(f.priceMax) }),
      remove: () => update({ ...f, priceMax: null }),
    });
  f.sizes.forEach((v) =>
    chips.push({
      key: `size-${v}`,
      label: fmt(c.sizeChip, { size: v }),
      remove: () => update({ ...f, sizes: f.sizes.filter((x) => x !== v) }),
    }),
  );
  f.stock.forEach((v) =>
    chips.push({
      key: `stock-${v}`,
      label: v === "in" ? c.availability.inStock : c.availability.onOrder,
      remove: () => update({ ...f, stock: f.stock.filter((x) => x !== v) }),
    }),
  );
  return chips;
}
