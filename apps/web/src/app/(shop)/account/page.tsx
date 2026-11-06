import { notFound } from "next/navigation";
import { ru } from "@/content/ru";
import { getConfig } from "@/lib/features";

export const metadata = { title: ru.account.title, robots: { index: false } };

export default async function AccountPage() {
  const { features } = await getConfig();
  if (!features.accounts) notFound(); // accounts module is switched off
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-4xl">{ru.account.title}</h1>
      <p className="text-muted mt-4">{ru.account.soon}</p>
    </div>
  );
}
