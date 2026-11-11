/** "2026-10-20" -> "20.10.2026". Manual on purpose: Intl output can differ between server and browser. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}
