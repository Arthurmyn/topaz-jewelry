import Link from "next/link";
import { ru } from "@/content/ru";
import { serverApi } from "@/lib/api/client";
import { getConfig } from "@/lib/features";
import { whatsappLink } from "@/lib/format";
import { Wordmark } from "./wordmark";

const link = "text-deep-text/90 transition-colors duration-150 hover:text-white";

export async function Footer() {
  const [config, { data: categories }] = await Promise.all([
    getConfig(),
    serverApi(300).GET("/api/v1/categories"),
  ]);

  return (
    <footer className="bg-deep text-deep-text mt-28">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-4 py-16 md:grid-cols-4 md:px-8">
        <div>
          <h2 className="font-serif text-2xl">{ru.footer.buyers}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/delivery" className={link}>
                {ru.nav.delivery}
              </Link>
            </li>
            <li>
              <Link href="/contacts" className={link}>
                {ru.nav.contacts}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl">{ru.footer.catalog}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {(categories ?? []).map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog/${c.slug}`} className={link}>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl">{ru.footer.company}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/about" className={link}>
                {ru.nav.about}
              </Link>
            </li>
            <li>
              <Link href="/stores" className={link}>
                {ru.nav.stores}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-2xl">{ru.footer.contact}</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {config.whatsapp_number && (
              <li>
                <a
                  href={whatsappLink(config.whatsapp_number)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link}
                >
                  {ru.footer.whatsapp}
                </a>
              </li>
            )}
            <li>
              <Link href="/stores" className={link}>
                {ru.footer.writeUs}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-deep-line border-t">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:px-8">
          <Wordmark light />
          <p className="text-deep-muted text-xs">{ru.footer.rights(new Date().getFullYear())}</p>
        </div>
      </div>
    </footer>
  );
}
