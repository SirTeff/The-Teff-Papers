import Image, { getImageProps } from "next/image";
import type { CSSProperties } from "react";
import styles from "./foundation.module.css";

export type EditorialArtworkImage = {
  src: string;
  alt: string;
  sizes: string;
  focalPoint?: string;
  mobile?: { src: string; width: number; height: number; focalPoint: string; preoptimized?: boolean };
};

export type ArtworkTone = "cool" | "warm" | "mixed";

export function EditorialArtwork({
  image,
  tone = "mixed",
  wide = false,
  eager = false,
  fetchPriority,
  className,
}: {
  image?: EditorialArtworkImage;
  tone?: ArtworkTone;
  wide?: boolean;
  eager?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  className?: string;
}) {
  const mobile = image?.mobile;
  const mobileImage = mobile && (mobile.preoptimized
    ? { srcSet: mobile.src, sizes: undefined }
    : getImageProps({ src: mobile.src, width: mobile.width, height: mobile.height, alt: "", sizes: image?.sizes }).props);
  return (
    <div
      className={[styles.artwork, className].filter(Boolean).join(" ")}
      data-tone={tone}
      data-wide={wide || undefined}
      data-artwork={image ? "image" : "fallback"}
      aria-hidden={image?.alt ? undefined : true}
    >
      {image ? (
        <picture>
          {mobileImage && <source media="(max-width: 42rem)" srcSet={mobileImage.srcSet} sizes={mobileImage.sizes} />}
          <Image
            src={image.src}
            alt={image.alt}
            sizes={image.sizes}
            fill
            fetchPriority={eager ? "high" : fetchPriority}
            loading={eager ? "eager" : "lazy"}
            style={{
              "--art-focus": image.focalPoint,
              "--art-mobile-focus": image.mobile?.focalPoint ?? image.focalPoint,
            } as CSSProperties}
          />
        </picture>
      ) : (
        <span className={styles.artworkContour} />
      )}
    </div>
  );
}
