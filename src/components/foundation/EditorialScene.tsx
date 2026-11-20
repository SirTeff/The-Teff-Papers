import type { ArtworkLayers } from "@/lib/artwork";
import { ArtworkPointerLight } from "./ArtworkPointerLight";
import { EditorialArtwork, type EditorialArtworkImage } from "./EditorialArtwork";
import styles from "./scene.module.css";

export function EditorialScene({
  className,
  image,
}: {
  className: string;
  image?: EditorialArtworkImage & { layers?: ArtworkLayers };
}) {
  const layers = image?.layers;
  const hasLayers = Boolean(layers?.background || layers?.foreground);
  return (
    <div className={`${styles.scene} ${className}`} data-editorial-entry>
      <div className={styles.plane} data-depth="base" data-ambient={hasLayers || undefined}>
        <EditorialArtwork className={styles.fill} image={image} eager />
      </div>
      {image && layers?.background && (
        <div className={styles.plane} data-depth="background" data-ambient>
          <EditorialArtwork className={styles.layer} image={{ ...layers.background, alt: "", sizes: image.sizes }} />
        </div>
      )}
      {hasLayers && <ArtworkPointerLight />}
      {image && layers?.foreground && (
        <div className={styles.plane} data-depth="foreground" data-ambient>
          <EditorialArtwork className={styles.layer} image={{ ...layers.foreground, alt: "", sizes: image.sizes }} />
        </div>
      )}
    </div>
  );
}
