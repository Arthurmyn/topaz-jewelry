"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { useDict } from "@/components/providers/app-providers";
import { PageIntro, ResultBlock } from "@/components/shop/page-intro";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Frontend-only: always answers the same, so it never reveals which emails are registered. */
export function ForgotPasswordView() {
  const dict = useDict();
  const p = dict.password;
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const crumbs = [
    { label: dict.common.home, href: "/" },
    { label: dict.auth.breadcrumb, href: "/login" },
    { label: p.forgotTitle },
  ];

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!EMAIL.test(email)) return setError(dict.common.invalidEmail);
    setError(null);
    setSent(true);
  }

  return (
    <>
      <PageIntro crumbs={crumbs} title={p.forgotTitle} subtitle={p.forgotText} />
      <div className="px-page flex flex-col items-start gap-6 pt-6 pb-24">
        {sent ? (
          <p role="status" className="fade-in text-16 text-ink max-w-md">
            {p.sent}
          </p>
        ) : (
          <form
            onSubmit={submit}
            noValidate
            className="flex w-full max-w-md flex-col items-start gap-5"
          >
            <Field label={p.email} htmlFor="fp-email" error={error} className="w-full">
              <Input
                id="fp-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                aria-invalid={Boolean(error)}
              />
            </Field>
            <Button type="submit">{p.send}</Button>
          </form>
        )}
        <Link href="/login" className="text-14 text-ink font-medium whitespace-pre">
          {p.back}
        </Link>
      </div>
    </>
  );
}

/** Frontend-only: any token of 8+ characters is accepted; the new password is not stored. */
export function ResetPasswordView() {
  const dict = useDict();
  const p = dict.password;
  const token = useSearchParams().get("token");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const crumbs = [
    { label: dict.common.home, href: "/" },
    { label: dict.auth.breadcrumb, href: "/login" },
    { label: p.resetTitle },
  ];

  if (!token || token.length < 8) {
    return (
      <>
        <PageIntro crumbs={crumbs} title={p.resetTitle} />
        <ResultBlock title={p.resetTitle} text={p.invalidLink}>
          <Button asChild>
            <Link href="/forgot-password">{p.forgotTitle}</Link>
          </Button>
        </ResultBlock>
      </>
    );
  }

  if (done) {
    return (
      <>
        <PageIntro crumbs={crumbs} title={p.doneTitle} />
        <ResultBlock title={p.doneTitle} text={p.doneText}>
          <Button asChild>
            <Link href="/login">{p.toLogin}</Link>
          </Button>
        </ResultBlock>
      </>
    );
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const a = String(d.get("password") ?? "");
    if (a.length < 8) return setError(p.tooShort);
    if (a !== String(d.get("confirm") ?? "")) return setError(p.mismatch);
    setError(null);
    setDone(true);
  }

  return (
    <>
      <PageIntro crumbs={crumbs} title={p.resetTitle} />
      <form
        onSubmit={submit}
        noValidate
        className="px-page flex w-full max-w-[calc(28rem+2*var(--page-pad))] flex-col items-start gap-5 pt-6 pb-24"
      >
        <Field label={p.newPassword} htmlFor="rp-password" className="w-full">
          <Input
            id="rp-password"
            name="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(error)}
          />
        </Field>
        <Field label={p.confirm} htmlFor="rp-confirm" error={error} className="w-full">
          <Input
            id="rp-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(error)}
          />
        </Field>
        <Button type="submit">{p.save}</Button>
      </form>
    </>
  );
}
