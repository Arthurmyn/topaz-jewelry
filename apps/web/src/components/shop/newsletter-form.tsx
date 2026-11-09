"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useDict } from "@/components/providers/app-providers";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Frontend-only: validates and shows success. The email is not sent anywhere yet. */
export function NewsletterForm() {
  const dict = useDict();
  const t = dict.home.newsletter;
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!EMAIL.test(email)) return setError(dict.common.invalidEmail);
    if (!form.get("consent")) return setError(dict.common.consentRequired);
    setError(null);
    setDone(true);
  }

  if (done) {
    return (
      <p role="status" className="text-16 text-ink">
        {t.success}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-full flex-col items-center gap-5">
      <div className="flex w-full max-w-[595px] flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          {t.email}
        </label>
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t.email}
          aria-invalid={error === dict.common.invalidEmail}
          className="sm:w-[420px]"
        />
        <Button type="submit">{t.submit}</Button>
      </div>
      <div className="relative">
        <Checkbox name="consent" label={t.consent} className="text-13 text-muted" />
        {/* Absolutely positioned so showing an error never shifts the layout. */}
        <p
          role="alert"
          className="text-12 text-error absolute top-full left-0 pt-2 whitespace-nowrap"
        >
          {error}
        </p>
      </div>
    </form>
  );
}
