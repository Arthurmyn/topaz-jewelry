import Link from "next/link";
import { ru } from "@/content/ru";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-4xl">{ru.errors.notFoundTitle}</h1>
      <p className="text-muted mt-3">{ru.errors.notFoundText}</p>
      <Button asChild className="mt-8">
        <Link href="/catalog">{ru.errors.toCatalog}</Link>
      </Button>
    </div>
  );
}
