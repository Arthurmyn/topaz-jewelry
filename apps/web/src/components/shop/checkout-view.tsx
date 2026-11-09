"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Radio } from "@/components/ui/radio";
import { useDict, useFeatures, useMoney } from "@/components/providers/app-providers";
import { MOCK_ORDERS } from "@/content/mock/orders";
import type { StoreId } from "@/content/mock/products";
import { resolveLines, sumKzt } from "@/lib/cart-items";
import { productTitle } from "@/lib/products";
import { clearCart, useCartLines } from "@/lib/state/cart";
import { useUser } from "@/lib/state/auth";
import { nextOrderNumber, saveOrder, type Order } from "@/lib/state/orders";
import { fmt } from "@/lib/text";

type Delivery = "pickup" | "delivery";
type Payment = "online" | "cod" | "request";
type Errors = Partial<
  Record<"name" | "phone" | "email" | "store" | "city" | "address" | "consent", string>
>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const block = "border-border flex flex-col items-start gap-5 border-b pb-8";
const blockTitle = "text-20 text-ink font-medium";

export function CheckoutView() {
  const dict = useDict();
  const money = useMoney();
  const { accounts, payments } = useFeatures();
  const user = useUser();
  const c = dict.checkout;
  const lines = resolveLines(useCartLines());
  const formRef = useRef<HTMLFormElement>(null);

  const [delivery, setDelivery] = useState<Delivery>("pickup");
  const [payment, setPayment] = useState<Payment>(payments ? "online" : "request");
  const [errors, setErrors] = useState<Errors>({});
  const [placed, setPlaced] = useState<string | null>(null);

  const prefill = accounts ? user : null;
  const totalKzt = sumKzt(lines);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    const next: Errors = {};
    if (!text("name")) next.name = dict.common.required;
    if (text("phone").replace(/\D/g, "").length < 10) next.phone = dict.common.invalidPhone;
    if (!EMAIL.test(text("email"))) next.email = dict.common.invalidEmail;
    if (delivery === "pickup" && !text("store")) next.store = dict.common.required;
    if (delivery === "delivery") {
      if (!text("city")) next.city = dict.common.required;
      if (!text("address")) next.address = dict.common.required;
    }
    if (!data.get("consent")) next.consent = dict.common.consentRequired;
    setErrors(next);

    const firstInvalid = Object.keys(next)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    // Frontend-only: the order is stored in this browser. Online payment is simulated as paid.
    const number = nextOrderNumber(MOCK_ORDERS.length);
    const order: Order = {
      number,
      createdAt: new Date().toISOString().slice(0, 10),
      status: payment === "online" ? "paid" : "placed",
      totalKzt,
      lines: lines.map((l) => l.line),
      payment,
      delivery,
    };
    saveOrder(order);
    clearCart();
    setPlaced(number);
  }

  if (placed) {
    return (
      <div className="px-page flex flex-col items-start gap-6 py-24">
        <h1 className="text-32 md:text-40 text-ink font-medium">{c.successTitle}</h1>
        <p role="status" className="text-16 text-muted">
          {fmt(c.successText, { number: placed })}
        </p>
        <Button asChild>
          <Link href="/catalog">{c.successCta}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: dict.common.home, href: "/" },
          { label: c.cart, href: "/cart" },
          { label: c.title },
        ]}
      />
      <div className="px-page py-5">
        <h1 className="text-32 md:text-40 text-ink font-medium">{c.title}</h1>
      </div>

      {lines.length === 0 ? (
        <div className="px-page flex flex-col items-start gap-6 pt-6 pb-24">
          <p className="text-16 text-muted">{c.emptyCart}</p>
          <Button asChild>
            <Link href="/catalog">{c.successCta}</Link>
          </Button>
        </div>
      ) : (
        <div className="px-page flex flex-col gap-10 pt-6 pb-24 lg:flex-row lg:gap-16">
          <form
            ref={formRef}
            onSubmit={submit}
            noValidate
            className="flex min-w-0 flex-1 flex-col items-start gap-8"
          >
            <section className={`${block} w-full`}>
              <h2 className={blockTitle}>{c.contacts}</h2>
              <div className="flex w-full flex-col gap-4 sm:flex-row">
                <Field label={c.name} htmlFor="name" error={errors.name} className="flex-1">
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    placeholder={c.namePlaceholder}
                    defaultValue={prefill?.name}
                    aria-invalid={Boolean(errors.name)}
                  />
                </Field>
                <Field label={c.phone} htmlFor="phone" error={errors.phone} className="flex-1">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={c.phonePlaceholder}
                    defaultValue={prefill?.phone}
                    aria-invalid={Boolean(errors.phone)}
                  />
                </Field>
              </div>
              <Field label={c.email} htmlFor="email" error={errors.email} className="w-full">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={c.emailPlaceholder}
                  defaultValue={prefill?.email}
                  aria-invalid={Boolean(errors.email)}
                />
              </Field>
              {accounts && !user && (
                <Link
                  href="/login"
                  className="text-13 text-ink font-medium underline underline-offset-2"
                >
                  {c.haveProfile}
                </Link>
              )}
            </section>

            <section className={`${block} w-full`}>
              <h2 className={blockTitle}>{c.receiving}</h2>
              <Radio
                name="delivery"
                title={c.pickup}
                hint={c.pickupHint}
                checked={delivery === "pickup"}
                onChange={() => setDelivery("pickup")}
              />
              <Field label={c.store} htmlFor="store" error={errors.store} className="w-full">
                <Select
                  id="store"
                  name="store"
                  defaultValue=""
                  required
                  disabled={delivery !== "pickup"}
                  aria-invalid={Boolean(errors.store)}
                  className="invalid:text-muted"
                >
                  <option value="" disabled>
                    {c.storePlaceholder}
                  </option>
                  {(["astana", "karaganda"] as StoreId[]).map((id) => (
                    <option key={id} value={id}>
                      {dict.stores[id].city}
                    </option>
                  ))}
                </Select>
              </Field>
              <Radio
                name="delivery"
                title={c.delivery}
                hint={c.deliveryHint}
                checked={delivery === "delivery"}
                onChange={() => setDelivery("delivery")}
              />
              <div className="flex w-full flex-col gap-4 sm:flex-row">
                <Field label={c.city} htmlFor="city" error={errors.city} className="flex-1">
                  <Input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    placeholder={c.cityPlaceholder}
                    disabled={delivery !== "delivery"}
                    aria-invalid={Boolean(errors.city)}
                  />
                </Field>
                <Field
                  label={c.address}
                  htmlFor="address"
                  error={errors.address}
                  className="flex-1"
                >
                  <Input
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    placeholder={c.addressPlaceholder}
                    disabled={delivery !== "delivery"}
                    aria-invalid={Boolean(errors.address)}
                  />
                </Field>
              </div>
            </section>

            <section className={`${block} w-full`}>
              <h2 className={blockTitle}>{c.payment}</h2>
              {payments && (
                <Radio
                  name="payment"
                  title={c.online}
                  hint={c.onlineHint}
                  checked={payment === "online"}
                  onChange={() => setPayment("online")}
                />
              )}
              <Radio
                name="payment"
                title={c.cod}
                hint={c.codHint}
                checked={payment === "cod"}
                onChange={() => setPayment("cod")}
              />
              <Radio
                name="payment"
                title={c.request}
                hint={c.requestHint}
                checked={payment === "request"}
                onChange={() => setPayment("request")}
              />
            </section>

            <section className={`${block} w-full`}>
              <h2 className={blockTitle}>{c.commentTitle}</h2>
              <Field label={c.comment} htmlFor="comment" className="w-full">
                <Textarea
                  id="comment"
                  name="comment"
                  placeholder={c.commentPlaceholder}
                  className="h-24"
                />
              </Field>
            </section>

            <div className="flex flex-col items-start gap-2">
              <Checkbox name="consent" label={c.consent} aria-invalid={Boolean(errors.consent)} />
              {errors.consent && (
                <p role="alert" className="text-12 text-error">
                  {errors.consent}
                </p>
              )}
            </div>
            <Button type="submit">{c.confirm}</Button>
          </form>

          <aside className="bg-soft flex w-full flex-col gap-5 self-start p-8 lg:w-[400px] lg:shrink-0">
            <h2 className="text-20 text-ink font-medium">{c.summary}</h2>
            {lines.map(({ line, product, totalKzt: lineTotal }) => (
              <div
                key={`${line.productId}-${line.purity}-${line.size ?? "x"}`}
                className="flex items-center gap-4"
              >
                <PhotoPlaceholder label={dict.common.photo} className="h-20 w-16 shrink-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-14 text-ink font-medium">{productTitle(product, dict)}</p>
                  <p className="text-13 text-muted">
                    {line.size !== null
                      ? fmt(c.lineMeta, { size: line.size, qty: line.qty })
                      : fmt(c.lineMetaNoSize, { qty: line.qty })}
                  </p>
                </div>
                <p className="text-14 text-ink font-medium whitespace-nowrap">{money(lineTotal)}</p>
              </div>
            ))}
            <div className="bg-border h-px w-full" />
            <div className="text-14 flex items-center justify-between">
              <span className="text-muted">{c.goods}</span>
              <span className="text-ink">{money(totalKzt)}</span>
            </div>
            <div className="text-14 flex items-center justify-between">
              <span className="text-muted">{c.deliveryRow}</span>
              <span className="text-ink">{c.deliveryRowValue}</span>
            </div>
            <div className="bg-border h-px w-full" />
            <div className="text-ink flex items-center justify-between font-medium">
              <span className="text-16">{c.total}</span>
              <span className="text-20">{money(totalKzt)}</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
