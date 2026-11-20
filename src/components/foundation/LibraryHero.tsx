import Link from "next/link";
import { publicationArtwork } from "@/lib/artwork";
import { EditorialArtwork } from "./EditorialArtwork";
import { LibraryHeroMotion } from "./LibraryHeroMotion";
import styles from "./library-hero.module.css";

export function LibraryHero() {
  return (
    <div className={styles.stage} data-editorial-entry>
      <link rel="preload" as="image" href={publicationArtwork.home.mobile.src} media="(max-width: 42rem)" fetchPriority="high" />
      <div className={styles.plate}>
        <EditorialArtwork className={styles.art} image={{ ...publicationArtwork.home, sizes: "100vw" }} eager />
        <LibraryHeroMotion />
        <Link className={styles.doorway} href="/papers" prefetch={false} aria-label="Explore the papers through the library entrance">
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
