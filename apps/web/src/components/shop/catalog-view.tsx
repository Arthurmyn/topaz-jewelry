import Link from "next/link";
import { ru } from "@/content/ru";
import { serverApi } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { ProductCard } from "./product-card";

type SearchParams = Record<string, string | string[] | undefined>;

const FILTER_KEYS = ["metal", "purity", "stone", "price_min", "price_max", "in_stock", "q", "sort"];

function toList(v: string | string[] | undefined): string[] {
  return v === undefined ? [] : Array.isArray(v) ? v : [v];
}

function buildQuery(sp: SearchParams, overrides: Record<string, string | undefined> = {}) {
  const usp = new URLSearchParams();
  for (const key of [...FILTER_KEYS, "page"]) {
    if (key in overrides) continue;
    toList(sp[key]).forEach((v) => usp.append(key, v));
  }
  for (const [k, v] of Object.entries(overrides)) if (v) usp.set(k, v);
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export async function CatalogView({
  category,
  searchParams,
  basePath,
}: {
  category?: string;
  searchParams: SearchParams;
  basePath: string;
}) {
  const api = serverApi(300);
  const page = Math.max(1, Number(toList(searchParams.page)[0] ?? 1) || 1);
  const sort = toList(searchParams.sort)[0] as "newest" | "price_asc" | "price_desc" | undefined;

  const [{ data }, { data: categories }] = await Promise.all([
    api.GET("/api/v1/products", {
      params: {
        query: {
          category,
          metal: toList(searchParams.metal),
          purity: toList(searchParams.purity).map(Number).filter(Boolean),
          stone: toList(searchParams.stone),
          price_min: toList(searchParams.price_min)[0]
            ? Number(toList(searchParams.price_min)[0])
            : undefined,
          price_max: toList(searchParams.price_max)[0]
            ? Number(toList(searchParams.price_max)[0])
            : undefined,
          in_stock: toList(searchParams.in_stock).includes("true"),
          q: toList(searchParams.q)[0],
          sort,
          page,
          page_size: 24,
          include: "facets",
        },
      },
    }),
    api.GET("/api/v1/categories"),
  ]);

  const items = data?.items ?? [];
  const facets = data?.facets;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;
  const selected = (key: string, value: string) => toList(searchParams[key]).includes(value);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-4xl">{ru.catalog.title}</h1>

      <nav className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/catalog"
          className={`rounded-sm border px-3 py-1 ${!category ? "border-ink" : "border-line"}`}
        >
          {ru.catalog.allCategories}
        </Link>
        {(categories ?? []).map((c) => (
          <Link
            key={c.slug}
            href={`/catalog/${c.slug}`}
            className={`rounded-sm border px-3 py-1 ${category === c.slug ? "border-ink" : "border-line"}`}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Plain GET form: filters live in the URL, work without JS and are shareable. */}
        <form method="get" action={basePath} className="space-y-5 text-sm">
          <details open className="lg:open:block">
            <summary className="mb-3 cursor-pointer font-medium lg:hidden">
              {ru.catalog.filters}
            </summary>
            <div className="space-y-5">
              <div>
                <Input
                  name="q"
                  defaultValue={toList(searchParams.q)[0]}
                  placeholder={ru.catalog.search}
                />
              </div>
              <FilterGroup title={ru.catalog.metal}>
                {facets?.metal.map((f) => (
                  <Check
                    key={f.value}
                    name="metal"
                    value={f.value}
                    checked={selected("metal", f.value)}
                    label={`${f.label} (${f.count})`}
                  />
                ))}
              </FilterGroup>
              <FilterGroup title={ru.catalog.purity}>
                {facets?.purity.map((f) => (
                  <Check
                    key={f.value}
                    name="purity"
                    value={f.value}
                    checked={selected("purity", f.value)}
                    label={`${f.label} (${f.count})`}
                  />
                ))}
              </FilterGroup>
              <FilterGroup title={ru.catalog.stone}>
                {facets?.stone.map((f) => (
                  <Check
                    key={f.value}
                    name="stone"
                    value={f.value}
                    checked={selected("stone", f.value)}
                    label={`${f.label} (${f.count})`}
                  />
                ))}
              </FilterGroup>
              <FilterGroup title={ru.catalog.price}>
                <div className="flex gap-2">
                  <Input
                    name="price_min"
                    type="number"
                    min={0}
                    placeholder={ru.catalog.priceFrom}
                    defaultValue={toList(searchParams.price_min)[0]}
                  />
                  <Input
                    name="price_max"
                    type="number"
                    min={0}
                    placeholder={ru.catalog.priceTo}
                    defaultValue={toList(searchParams.price_max)[0]}
                  />
                </div>
              </FilterGroup>
              <Check
                name="in_stock"
                value="true"
                checked={selected("in_stock", "true")}
                label={ru.catalog.inStock}
              />
              <div>
                <p className="mb-2 font-medium">{ru.catalog.sort}</p>
                <Select name="sort" defaultValue={sort ?? "newest"}>
                  {Object.entries(ru.catalog.sortOptions).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{ru.catalog.apply}</Button>
                <Button asChild variant="outline">
                  <Link href={basePath}>{ru.catalog.reset}</Link>
                </Button>
              </div>
            </div>
          </details>
        </form>

        <section>
          <p className="text-muted mb-4 text-sm">{ru.catalog.found(data?.total ?? 0)}</p>
          {items.length === 0 ? (
            <p className="py-16 text-center">{ru.catalog.empty}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4 text-sm">
              {page > 1 && (
                <Link href={`${basePath}${buildQuery(searchParams, { page: String(page - 1) })}`}>
                  {ru.catalog.prev}
                </Link>
              )}
              <span className="text-muted">{ru.catalog.page(page, totalPages)}</span>
              {page < totalPages && (
                <Link href={`${basePath}${buildQuery(searchParams, { page: String(page + 1) })}`}>
                  {ru.catalog.next}
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 font-medium">{title}</legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function Check({
  name,
  value,
  checked,
  label,
}: {
  name: string;
  value: string;
  checked: boolean;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="accent-gold size-4"
      />
      {label}
    </label>
  );
}
