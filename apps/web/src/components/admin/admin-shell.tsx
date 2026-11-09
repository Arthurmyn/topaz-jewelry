"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ru } from "@/content/admin-ru";
import { adminFetch } from "@/lib/admin-api";
import { resources } from "@/lib/admin-resources";
import { Button } from "@/components/ui/button";

type SessionUser = { email: string; role: string } | null;

/** Client-side guard + navigation. The API enforces admin rights on every call regardless. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | undefined>(undefined);
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    adminFetch<SessionUser>("/auth/session")
      .then((u) => {
        if (!u || u.role !== "admin") router.replace("/admin/login");
        else setUser(u);
      })
      .catch(() => router.replace("/admin/login"));
  }, [isLogin, router]);

  if (isLogin) return <>{children}</>;
  if (!user) return <p className="text-muted p-8">{ru.admin.loading}</p>;

  async function logout() {
    await adminFetch("/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[220px_1fr]">
      <aside className="border-line bg-sand border-r p-4">
        <p className="font-serif text-xl">{ru.admin.title}</p>
        <nav className="mt-6 flex flex-col gap-1 text-sm">
          <Link href="/admin" className="rounded-sm px-2 py-1.5 hover:bg-white">
            {ru.admin.dashboard}
          </Link>
          {resources.map((r) => (
            <Link
              key={r.key}
              href={`/admin/${r.key}`}
              className={`rounded-sm px-2 py-1.5 hover:bg-white ${pathname === `/admin/${r.key}` ? "bg-white font-medium" : ""}`}
            >
              {ru.admin.resources[r.key].title}
            </Link>
          ))}
        </nav>
        <div className="mt-8 text-xs">
          <p className="text-muted break-all">{user.email}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={logout}>
            {ru.admin.logout}
          </Button>
        </div>
      </aside>
      <div className="p-6">{children}</div>
    </div>
  );
}
