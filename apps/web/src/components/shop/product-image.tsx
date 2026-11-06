import Image from "next/image";
import { ru } from "@/content/ru";
import type { ImageOut } from "@/lib/api/types";

export function ProductImage({
  image,
  sizes,
  priority = false,
}: {
  image: ImageOut | null;
  sizes: string;
  priority?: boolean;
}) {
  if (!image) {
    return (
      <div className="bg-sand text-muted flex aspect-square items-center justify-center text-sm">
        {ru.product.noImage}
      </div>
    );
  }
  return (
    <Image
      src={image.storage_key}
      alt={image.alt ?? ""}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className="aspect-square w-full object-cover"
    />
  );
}
