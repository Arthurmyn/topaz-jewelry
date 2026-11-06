const nf = new Intl.NumberFormat("ru-RU");

/** Amounts are integers in minor units (tiyn). 1 KZT = 100 tiyn. */
export function formatPrice(minor: number): string {
  return `${nf.format(Math.round(minor / 100))} ₸`;
}

export function whatsappLink(number: string, text?: string): string {
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${number.replace(/\D/g, "")}${q}`;
}
