"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Textarea } from "@/components/ui/input";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { useDict, useMoney } from "@/components/providers/app-providers";

const AMOUNTS_KZT = [10000, 20000, 50000, 100000];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Frontend-only: validates and shows a confirmation; the request is not sent anywhere yet. */
export function GiftCardForm() {
  const dict = useDict();
  const g = dict.giftCards;
  const money = useMoney();
  const [amount, setAmount] = useState(AMOUNTS_KZT[1] ?? 20000);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (!String(d.get("name") ?? "").trim()) next.name = dict.common.required;
    if (!EMAIL.test(String(d.get("email") ?? "").trim())) next.email = dict.common.invalidEmail;
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  return (
    <div className="px-page flex flex-col gap-10 pt-6 pb-24 lg:flex-row lg:gap-16">
      <PhotoPlaceholder
        label={g.photo}
        className="h-[260px] w-full lg:h-[420px] lg:w-[560px] lg:shrink-0"
      />
      {done ? (
        <p role="status" className="fade-in text-16 text-ink max-w-md">
          {g.success}
        </p>
      ) : (
        <form
          onSubmit={submit}
          noValidate
          className="flex min-w-0 flex-1 flex-col items-start gap-5"
        >
          <div className="flex flex-col gap-3">
            <p className="text-14 text-ink font-medium">{g.amount}</p>
            <div className="flex flex-wrap gap-2">
              {AMOUNTS_KZT.map((value) => (
                <Chip
                  key={value}
                  size="lg"
                  selected={amount === value}
                  onClick={() => setAmount(value)}
                >
                  {money(value)}
                </Chip>
              ))}
            </div>
          </div>
          <Field label={g.recipientName} htmlFor="gc-name" error={errors.name} className="w-full">
            <Input
              id="gc-name"
              name="name"
              placeholder={g.recipientNamePlaceholder}
              aria-invalid={Boolean(errors.name)}
            />
          </Field>
          <Field
            label={g.recipientEmail}
            htmlFor="gc-email"
            error={errors.email}
            className="w-full"
          >
            <Input
              id="gc-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              aria-invalid={Boolean(errors.email)}
            />
          </Field>
          <Field label={g.message} htmlFor="gc-message" className="w-full">
            <Textarea
              id="gc-message"
              name="message"
              placeholder={g.messagePlaceholder}
              className="h-24"
            />
          </Field>
          <Button type="submit">{g.submit}</Button>
          <p className="text-13 text-muted">{g.note}</p>
        </form>
      )}
    </div>
  );
}
