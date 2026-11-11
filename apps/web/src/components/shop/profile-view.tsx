"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, Input } from "@/components/ui/input";
import { SideNav } from "@/components/ui/side-nav";
import { useDict, useLocale, useMoney } from "@/components/providers/app-providers";
import { MOCK_ORDERS } from "@/content/mock/orders";
import { getProductById, type Product } from "@/content/mock/products";
import { cn } from "@/lib/cn";
import { INTL_TAG } from "@/lib/locale";
import { signOut, updateUser, useUser } from "@/lib/state/auth";
import { useFavorites } from "@/lib/state/favorites";
import { useLocalOrders, type OrderStatus } from "@/lib/state/orders";
import { fmt } from "@/lib/text";
import { useMounted } from "@/lib/use-mounted";
import { ProductCard } from "./product-card";
import { ProductGrid } from "./product-grid";

/** MOCK account area (frontend-only): data comes from localStorage and the mock order list. */
export function ProfileView() {
  const dict = useDict();
  const p = dict.profile;
  const locale = useLocale();
  const money = useMoney();
  const router = useRouter();
  const mounted = useMounted();
  const user = useUser();
  const favoriteIds = useFavorites();
  const localOrders = useLocalOrders();
  const [active, setActive] = useState("orders");
  const [saved, setSaved] = useState(false);

  if (!mounted) return null;

  if (!user) {
    return (
      <>
        <Breadcrumbs items={[{ label: dict.common.home, href: "/" }, { label: p.breadcrumb }]} />
        <div className="px-page flex flex-col items-start gap-6 py-16">
          <h1 className="text-32 md:text-40 text-ink font-medium">{p.guestTitle}</h1>
          <Button asChild>
            <Link href="/login">{p.guestCta}</Link>
          </Button>
        </div>
      </>
    );
  }

  const orders = [...localOrders, ...MOCK_ORDERS].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const favorites = favoriteIds.map(getProductById).filter((x): x is Product => Boolean(x));
  const date = (iso: string) =>
    new Intl.DateTimeFormat(INTL_TAG[locale], {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  const go = (id: string) => () => setActive(id);

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    updateUser({
      name: String(d.get("name") ?? "").trim(),
      phone: String(d.get("phone") ?? "").trim(),
      email: String(d.get("email") ?? "").trim(),
      newsletter: Boolean(d.get("newsletter")),
    });
    setSaved(true);
  }

  const statusChip = (status: OrderStatus) => (
    <span
      className={cn(
        "text-13 inline-flex items-center justify-center border px-3 py-2.5 font-medium",
        status === "placed" ? "border-ink bg-ink text-white" : "border-border text-ink",
      )}
    >
      {p.orders.statuses[status]}
    </span>
  );

  return (
    <>
      <Breadcrumbs items={[{ label: dict.common.home, href: "/" }, { label: p.breadcrumb }]} />
      <div className="px-page flex flex-wrap items-center gap-4 py-5">
        <h1 className="text-32 md:text-40 text-ink font-medium">{p.title}</h1>
        <p className="text-14 text-muted">{fmt(p.greeting, { name: user.name })}</p>
      </div>

      <div className="px-page flex flex-col gap-10 pt-6 pb-24 lg:flex-row lg:gap-16">
        <SideNav
          label={p.title}
          items={[
            {
              label: p.nav.orders,
              href: "#orders",
              active: active === "orders",
              onClick: go("orders"),
            },
            {
              label: p.nav.favorites,
              href: "#favorites",
              active: active === "favorites",
              onClick: go("favorites"),
            },
            { label: p.nav.data, href: "#data", active: active === "data", onClick: go("data") },
            {
              label: p.nav.addresses,
              href: "#data",
              active: active === "addresses",
              onClick: go("addresses"),
            },
            {
              label: p.nav.newsletter,
              href: "#data",
              active: active === "newsletter",
              onClick: go("newsletter"),
            },
            {
              label: p.nav.logout,
              onClick: () => {
                signOut();
                router.push("/");
              },
            },
          ]}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-14">
          <section id="orders" className="flex scroll-mt-6 flex-col gap-2">
            <h2 className="text-24 text-ink font-medium">{p.orders.title}</h2>
            {orders.length === 0 ? (
              <p className="text-14 text-muted pt-4">{p.orders.empty}</p>
            ) : (
              <div role="table" aria-label={p.orders.title} className="flex w-full flex-col gap-2">
                <div
                  role="row"
                  className="border-border text-12 text-muted flex items-center border-b py-3"
                >
                  {[p.orders.order, p.orders.date, p.orders.status, p.orders.sum].map((h) => (
                    <div key={h} role="columnheader" className="min-w-0 flex-1">
                      {h}
                    </div>
                  ))}
                </div>
                {orders.map((o) => (
                  <div
                    key={o.number}
                    role="row"
                    className="border-border text-14 text-ink flex items-center border-b py-[18px]"
                  >
                    <div role="cell" className="min-w-0 flex-1">
                      <Link href={`/order/${o.number}`} className="hover:underline">
                        {fmt(p.orders.number, { number: o.number })}
                      </Link>
                    </div>
                    <div role="cell" className="min-w-0 flex-1">
                      {date(o.createdAt)}
                    </div>
                    <div role="cell" className="min-w-0 flex-1">
                      {statusChip(o.status)}
                    </div>
                    <div role="cell" className="min-w-0 flex-1">
                      {money(o.totalKzt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="favorites" className="flex scroll-mt-6 flex-col gap-6">
            <h2 className="text-24 text-ink font-medium">{p.favorites.title}</h2>
            {favorites.length === 0 ? (
              <p className="text-14 text-muted">{p.favorites.empty}</p>
            ) : (
              <ProductGrid columns={3}>
                {favorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </ProductGrid>
            )}
          </section>

          <section id="data" className="flex scroll-mt-6 flex-col gap-5">
            <h2 className="text-24 text-ink font-medium">{p.data.title}</h2>
            <form
              onSubmit={save}
              className="flex flex-col items-start gap-5"
              key={`${user.name}${user.phone}${user.email}`}
            >
              <div className="flex w-full flex-col gap-4 sm:flex-row">
                <Field label={p.data.name} htmlFor="p-name" className="flex-1">
                  <Input id="p-name" name="name" autoComplete="name" defaultValue={user.name} />
                </Field>
                <Field label={p.data.phone} htmlFor="p-phone" className="flex-1">
                  <Input
                    id="p-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    defaultValue={user.phone}
                    placeholder={dict.checkout.phonePlaceholder}
                  />
                </Field>
              </div>
              <Field label={p.data.email} htmlFor="p-email" className="w-full">
                <Input
                  id="p-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  defaultValue={user.email}
                />
              </Field>
              <Checkbox
                name="newsletter"
                label={p.data.newsletter}
                defaultChecked={user.newsletter}
              />
              <Button type="submit">{p.data.save}</Button>
              {saved && (
                <p role="status" className="text-13 text-muted">
                  {p.data.saved}
                </p>
              )}
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
