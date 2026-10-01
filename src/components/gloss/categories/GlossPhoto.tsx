import Image from 'next/image';
import { isOptimisable } from '@/lib/images';
import { categoryImage } from '@/lib/gloss/images';

/**
 * A category's own photo when it has one (Admin → Categories uploads land on
 * static.cocojojo.com), otherwise the Gloss Studio photo that matches its
 * name — the same fallback the prototype uses for every category.
 */
export function categoryPhoto(c: { imageUrl?: string | null; slug?: string | null; name?: string | null }): string {
  return c.imageUrl || categoryImage(c.slug || c.name);
}

/**
 * next/image for the directory photos. The uploaded category images are
 * multi-megabyte PNGs, so remote ones go through the optimiser; anything the
 * optimiser is not configured for (local /gloss/*.webp included) is passed
 * through as-is. Sizing comes from the gloss stylesheet, not from here.
 */
export function GlossPhoto({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  fill = false,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const remote = /^https?:\/\//.test(src);
  return (
    <Image
      src={src}
      alt={alt}
      {...(fill ? { fill: true } : { width: width ?? 430, height: height ?? 300 })}
      sizes={sizes}
      priority={priority}
      unoptimized={remote ? !isOptimisable(src) : true}
    />
  );
}
