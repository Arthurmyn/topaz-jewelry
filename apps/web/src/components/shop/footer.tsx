import { ru } from "@/content/ru";

export function Footer() {
  return (
    <footer className="border-line text-muted mt-16 border-t py-8 text-center text-sm">
      <p className="text-ink font-serif text-lg">{ru.site.name}</p>
      <p className="mt-1">{ru.site.tagline}</p>
      <p className="mt-4">{ru.footer.rights(new Date().getFullYear())}</p>
    </footer>
  );
}
