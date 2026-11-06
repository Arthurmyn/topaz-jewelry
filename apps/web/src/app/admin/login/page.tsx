"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ru } from "@/content/ru";
import { AdminApiError, adminFetch } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const t = ru.admin.login;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const user = await adminFetch<{ role: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (user.role !== "admin") {
        await adminFetch("/auth/logout", { method: "POST" });
        setError(t.notAdmin);
        return;
      }
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof AdminApiError && err.status === 401 ? t.failed : ru.admin.errors.generic,
      );
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-sm px-4">
      <h1 className="font-serif text-3xl">{t.title}</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">{t.email}</Label>
          <Input id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div>
          <Label htmlFor="password">{t.password}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" className="w-full">
          {t.submit}
        </Button>
      </form>
    </div>
  );
}
