import type { Metadata } from "next";
import { ru } from "@/content/ru";
import { serverApi } from "@/lib/api/client";

export const metadata: Metadata = { title: ru.stores.title, alternates: { canonical: "/stores" } };

export default async function StoresPage() {
  const { data: stores } = await serverApi(300).GET("/api/v1/stores");
  const jsonLd = (stores ?? []).map((s) => ({
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: s.name,
    address: s.address,
    telephone: s.phone ?? undefined,
    geo:
      s.lat && s.lng ? { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng } : undefined,
  }));
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <h1 className="font-serif text-4xl">{ru.stores.title}</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {(stores ?? []).map((s) => (
          <article key={s.slug} className="border-line border p-6">
            <h2 className="font-serif text-2xl">{s.city}</h2>
            <p className="mt-2">{s.address}</p>
            {s.phone && (
              <p className="mt-2 text-sm">
                <span className="text-muted">{ru.stores.phone}: </span>
                <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</a>
              </p>
            )}
            {s.opening_hours && (
              <div className="mt-2 text-sm">
                <p className="text-muted">{ru.stores.hours}:</p>
                {Object.entries(s.opening_hours).map(([d, h]) => (
                  <p key={d}>
                    {d}: {h}
                  </p>
                ))}
              </div>
            )}
            {s.lat && s.lng && (
              <a
                className="text-gold-dark mt-3 inline-block text-sm underline"
                href={`https://yandex.kz/maps/?pt=${s.lng},${s.lat}&z=16&l=map`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {ru.stores.map}
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
