"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import { useDict } from "@/components/providers/app-providers";
import type { StoreId } from "@/content/mock/products";

type Errors = Partial<Record<"name" | "phone" | "store", string>>;

/** Frontend-only: validates and shows a confirmation; nothing is sent anywhere yet. */
export function FittingForm() {
  const dict = useDict();
  const f = dict.stores.page.form;
  const params = useSearchParams();
  const preset = params.get("store");
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const next: Errors = {};
    if (!String(d.get("name") ?? "").trim()) next.name = dict.common.required;
    if (String(d.get("phone") ?? "").replace(/\D/g, "").length < 10)
      next.phone = dict.common.invalidPhone;
    if (!d.get("store")) next.store = dict.common.required;
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <p role="status" className="fade-in text-16 text-ink">
        {f.success}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-full flex-col items-center gap-7">
      <div className="flex w-full flex-col items-start gap-4 md:flex-row md:items-end">
        <Field label={f.name} htmlFor="f-name" error={errors.name} className="w-full flex-1">
          <Input
            id="f-name"
            name="name"
            autoComplete="name"
            placeholder={f.namePlaceholder}
            aria-invalid={Boolean(errors.name)}
          />
        </Field>
        <Field label={f.phone} htmlFor="f-phone" error={errors.phone} className="w-full flex-1">
          <Input
            id="f-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={f.phonePlaceholder}
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>
        <Field label={f.store} htmlFor="f-store" error={errors.store} className="w-full flex-1">
          <Select
            id="f-store"
            name="store"
            required
            defaultValue={preset === "astana" || preset === "karaganda" ? preset : ""}
            aria-invalid={Boolean(errors.store)}
            className="invalid:text-muted"
          >
            <option value="" disabled>
              {f.storePlaceholder}
            </option>
            {(["astana", "karaganda"] as StoreId[]).map((id) => (
              <option key={id} value={id}>
                {dict.stores[id].city}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={f.date} htmlFor="f-date" className="w-full flex-1">
          <Input id="f-date" name="date" type="date" aria-label={f.datePlaceholder} />
        </Field>
      </div>
      <Button type="submit">{f.submit}</Button>
    </form>
  );
}
