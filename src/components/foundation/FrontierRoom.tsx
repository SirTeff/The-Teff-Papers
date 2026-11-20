import type { ArtworkRecord } from "@/lib/artwork";
import type { FrontierMotion } from "@/lib/frontier-motion";
import { EditorialArtwork } from "./EditorialArtwork";
import { EditorialScene } from "./EditorialScene";
import { FrontierOpeningMotion } from "./FrontierOpeningMotion";
import styles from "./frontier-room.module.css";

export function FrontierRoom({ artwork, motion }: { artwork?: ArtworkRecord; motion?: FrontierMotion }) {
  const matchedMobile = artwork?.mobile && artwork.mobile.width * artwork.height === artwork.width * artwork.mobile.height;
  const image = artwork && {
    ...artwork, mobile: !motion || matchedMobile ? artwork.mobile : undefined, sizes: "100vw",
  };
  const layered = !motion && (artwork?.layers?.foreground || artwork?.layers?.background);
  return (
    <div className={styles.room} style={artwork ? { aspectRatio: `${artwork.width} / ${artwork.height}` } : undefined} data-editorial-entry>
      {layered ? <EditorialScene className={styles.artwork} image={image} /> : <EditorialArtwork className={styles.artwork} image={image} eager />}
      {artwork && motion && <FrontierOpeningMotion key={artwork.src} motion={motion} />}
    </div>
  );
}
