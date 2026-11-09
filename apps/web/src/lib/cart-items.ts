import { getProductById, type Product } from "@/content/mock/products";
import type { CartLine } from "@/lib/state/cart";

export type ResolvedLine = { line: CartLine; product: Product; unitKzt: number; totalKzt: number };

/** Join cart lines with catalog products; lines whose product no longer exists are dropped. */
export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((line) => {
    const product = getProductById(line.productId);
    if (!product || !product.purities.includes(line.purity)) return [];
    const unitKzt = product.prices[line.purity];
    return [{ line, product, unitKzt, totalKzt: unitKzt * line.qty }];
  });
}

export function sumKzt(lines: ResolvedLine[]): number {
  return lines.reduce((sum, l) => sum + l.totalKzt, 0);
}
