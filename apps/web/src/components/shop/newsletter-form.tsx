"use client";

import { useState } from "react";
import { ru } from "@/content/ru";
import { Button } from "@/components/ui/button";

/**
 * UI only for now: the newsletter API (double opt-in) is a later module.
 * It tells the visitor honestly that subscription is not live yet instead of pretending.
 */
export function NewsletterForm() {
  const [message, setMessage] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setMessage(form.get("consent") ? ru.newsletter.soon : ru.newsletter.needConsent);
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-md">
      <label htmlFor="newsletter-email" className="sr-only">
        {ru.newsletter.email}
      </label>
      <div className="border-ink/40 focus-within:border-ink flex items-end gap-3 border-b transition-colors duration-150">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={ru.newsletter.email}
          className="placeholder:text-muted h-12 min-w-0 flex-1 bg-transparent text-base outline-none"
        />
        <Button type="submit" variant="light" size="sm" className="mb-2">
          {ru.newsletter.submit}
        </Button>
      </div>
      <label className="text-muted mt-4 flex items-start gap-3 text-xs leading-relaxed">
        <input type="checkbox" name="consent" className="mt-0.5 size-4 shrink-0" />
        {ru.newsletter.consent}
      </label>
      <p role="status" className="mt-3 min-h-5 text-sm">
        {message}
      </p>
    </form>
  );
}
