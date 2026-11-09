/** Non-translatable site constants (contacts, links). Values are placeholders from the wireframe. */
export const SITE = {
  name: "Topaz Jewelry",
  /** WhatsApp number in international format without "+": placeholder until the client gives one. */
  whatsappNumber: "70000000000",
  phoneDisplay: "+7 000 000 00 00",
  stores: {
    astana: { mapUrl: "https://2gis.kz/astana", routeUrl: "https://2gis.kz/astana" },
    karaganda: { mapUrl: "https://2gis.kz/karaganda", routeUrl: "https://2gis.kz/karaganda" },
  },
  social: {
    instagram: "https://instagram.com/",
    whatsapp: "https://wa.me/70000000000",
    twoGis: "https://2gis.kz/",
  },
} as const;
