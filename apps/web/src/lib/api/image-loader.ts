// Custom next/image loader: picks a pre-generated variant (see apps/api/app/core/images.py).
const WIDTHS = [320, 640, 960, 1440];

export default function imageLoader({ src, width }: { src: string; width: number }): string {
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `/media/${src}/${w}.webp`;
}
