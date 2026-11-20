import type { Metadata } from "next";
import { ArchiveGallery } from "@/components/papers/ArchiveGallery";
import { CategoryLinks } from "@/components/papers/CategoryLinks";
import { getAllPapers } from "@/lib/papers";
import styles from "../editorial.module.css";

export const metadata: Metadata = { title: "The Papers", description: "The complete archive of ideas, reflections, and working papers." };

export default function PapersPage() {
  const papers = getAllPapers();
  return (
    <div className={styles.archive}>
      <div className={styles.frame}>
        <header className={styles.archiveHeader} data-editorial-entry>
          <p className={styles.kicker}>The archive</p>
          <h1>The Papers</h1>
          <p>A growing record of ideas noticed early enough to be preserved.</p>
          <CategoryLinks includeAll />
        </header>
        <ArchiveGallery papers={papers} featureFirst />
      </div>
    </div>
  );
}
