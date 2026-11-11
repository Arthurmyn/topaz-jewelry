import Link from "next/link";
import { SITE } from "@/content/site";
import { getDict } from "@/lib/i18n-server";

const link = "text-14 text-muted transition-colors duration-150 hover:text-ink";

export async function Footer() {
  const dict = await getDict();
  const f = dict.footer;

  const columns: { title: string; links: { label: string; href: string; external?: boolean }[] }[] =
    [
      {
        title: f.buyers.title,
        links: [
          { label: f.buyers.delivery, href: "/info/delivery" },
          { label: f.buyers.sizes, href: "/info/sizes" },
          { label: f.buyers.care, href: "/info/care" },
          { label: f.buyers.faq, href: "/info/faq" },
        ],
      },
      {
        title: f.about.title,
        links: [
          { label: f.about.brand, href: "/about" },
          { label: f.about.stores, href: "/stores" },
          { label: f.about.contacts, href: "/info/contacts" },
          { label: f.about.news, href: "/blog" },
        ],
      },
      {
        title: f.info.title,
        links: [
          { label: f.info.offer, href: "/info/offer" },
          { label: f.info.privacy, href: "/info/privacy" },
          { label: f.info.returns, href: "/info/returns" },
          { label: f.info.services, href: "/services" },
        ],
      },
      {
        title: f.social.title,
        links: [
          { label: f.social.instagram, href: SITE.social.instagram, external: true },
          { label: f.social.whatsapp, href: SITE.social.whatsapp, external: true },
          { label: f.social.twoGis, href: SITE.social.twoGis, external: true },
        ],
      },
    ];

  return (
    <footer className="px-page w-full bg-white pt-[72px] pb-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-14">
        <div className="grid grid-cols-2 gap-x-12 gap-y-10 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="text-14 text-ink font-medium">{col.title}</p>
              {col.links.map((l) =>
                l.external ? (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={link}
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link key={l.label} href={l.href} className={link}>
                    {l.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <p className="text-13 text-muted">{f.copyright}</p>
      </div>
    </footer>
  );
}
