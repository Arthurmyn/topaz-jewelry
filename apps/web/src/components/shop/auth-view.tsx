"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, Input } from "@/components/ui/input";
import { useDict } from "@/components/providers/app-providers";
import { signIn, useUser } from "@/lib/state/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const card =
  "border-border flex w-full max-w-[500px] flex-col items-start gap-5 border p-6 sm:p-10";

/**
 * MOCK login and registration (frontend-only): nothing is verified, the profile lives in
 * this browser's localStorage. Swap for the real API when the backend exists.
 */
export function AuthView() {
  const dict = useDict();
  const a = dict.auth;
  const router = useRouter();
  const existing = useUser();
  const [googleNote, setGoogleNote] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const email = String(d.get("email") ?? "").trim();
    const errors: Record<string, string> = {};
    if (!EMAIL.test(email)) errors.email = dict.common.invalidEmail;
    if (!String(d.get("password") ?? "")) errors.password = dict.common.required;
    setLoginErrors(errors);
    if (Object.keys(errors).length) return;
    const name = existing?.email === email ? existing.name : (email.split("@")[0] ?? email);
    signIn({
      name,
      phone: existing?.email === email ? existing.phone : "",
      email,
      newsletter: existing?.newsletter ?? false,
    });
    router.push("/profile");
  }

  function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const text = (k: string) => String(d.get(k) ?? "").trim();
    const errors: Record<string, string> = {};
    if (!text("name")) errors.name = dict.common.required;
    if (text("phone").replace(/\D/g, "").length < 10) errors.phone = dict.common.invalidPhone;
    if (!EMAIL.test(text("email"))) errors.email = dict.common.invalidEmail;
    if (text("password").length < 8) errors.password = a.register.passwordMin;
    if (!d.get("consentData")) errors.consentData = dict.common.consentRequired;
    setRegErrors(errors);
    if (Object.keys(errors).length) return;
    signIn({
      name: text("name"),
      phone: text("phone"),
      email: text("email"),
      newsletter: Boolean(d.get("consentNews")),
    });
    router.push("/profile");
  }

  return (
    <>
      <Breadcrumbs items={[{ label: dict.common.home, href: "/" }, { label: a.breadcrumb }]} />
      <div className="px-page flex flex-col items-center gap-10 pt-12 pb-24 lg:flex-row lg:items-start lg:justify-center lg:gap-16">
        <form onSubmit={login} noValidate className={card}>
          <h1 className="text-28 text-ink font-medium">{a.login.title}</h1>
          <Field
            label={a.login.email}
            htmlFor="login-email"
            error={loginErrors.email}
            className="w-full"
          >
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder={a.login.emailPlaceholder}
              aria-invalid={Boolean(loginErrors.email)}
            />
          </Field>
          <Field
            label={a.login.password}
            htmlFor="login-password"
            error={loginErrors.password}
            className="w-full"
          >
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder={a.login.passwordPlaceholder}
              aria-invalid={Boolean(loginErrors.password)}
            />
          </Field>
          <div className="flex w-full items-center justify-between gap-4">
            <Checkbox name="remember" label={a.login.remember} />
            <Link
              href="/forgot-password"
              className="text-13 text-ink font-medium whitespace-nowrap underline underline-offset-2"
            >
              {a.login.forgot}
            </Link>
          </div>
          <Button type="submit" className="w-full">
            {a.login.submit}
          </Button>
          <p className="text-13 text-muted w-full text-center">{a.login.or}</p>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setGoogleNote(true)}
          >
            {a.login.google}
          </Button>
          {googleNote && (
            <p role="status" className="text-13 text-muted">
              {a.login.googleSoon}
            </p>
          )}
        </form>

        <form onSubmit={register} noValidate className={card}>
          <h2 className="text-28 text-ink font-medium">{a.register.title}</h2>
          <div className="flex w-full flex-col gap-4 sm:flex-row">
            <Field
              label={a.register.name}
              htmlFor="reg-name"
              error={regErrors.name}
              className="flex-1"
            >
              <Input
                id="reg-name"
                name="name"
                autoComplete="name"
                placeholder={a.register.namePlaceholder}
                aria-invalid={Boolean(regErrors.name)}
              />
            </Field>
            <Field
              label={a.register.phone}
              htmlFor="reg-phone"
              error={regErrors.phone}
              className="flex-1"
            >
              <Input
                id="reg-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={a.register.phonePlaceholder}
                aria-invalid={Boolean(regErrors.phone)}
              />
            </Field>
          </div>
          <Field
            label={a.register.email}
            htmlFor="reg-email"
            error={regErrors.email}
            className="w-full"
          >
            <Input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={a.register.emailPlaceholder}
              aria-invalid={Boolean(regErrors.email)}
            />
          </Field>
          <Field
            label={a.register.password}
            htmlFor="reg-password"
            error={regErrors.password}
            className="w-full"
          >
            <Input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={a.register.passwordPlaceholder}
              aria-invalid={Boolean(regErrors.password)}
            />
          </Field>
          <div className="flex flex-col gap-2">
            <Checkbox name="consentData" label={a.register.consentData} />
            {regErrors.consentData && (
              <p role="alert" className="text-12 text-error">
                {regErrors.consentData}
              </p>
            )}
          </div>
          <Checkbox name="consentNews" label={a.register.consentNews} />
          <Button type="submit" className="w-full">
            {a.register.submit}
          </Button>
          <p className="text-13 text-muted leading-5">{a.register.note}</p>
        </form>
      </div>
    </>
  );
}
