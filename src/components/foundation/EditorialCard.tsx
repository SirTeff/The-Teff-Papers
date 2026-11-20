import Link from "next/link";
import type { ComponentProps } from "react";
import type { Paper } from "@/lib/papers";
import { getPaperCardArtwork } from "@/lib/artwork";
import { PaperMeta } from "@/components/papers/PaperMeta";
import { EditorialArtwork } from "./EditorialArtwork";
import styles from "./foundation.module.css";

export function EditorialCard({
  paper,
  artwork,
  featured = false,
  artworkEnd = false,
  headingLevel = 3,
  sizes = "(max-width: 42rem) 92vw, (max-width: 62rem) 46vw, 400px",
}: {
  paper: Pick<Paper, "slug" | "title" | "excerpt" | "category" | "date" | "readingTime">;
  artwork?: ComponentProps<typeof EditorialArtwork>;
  featured?: boolean;
  artworkEnd?: boolean;
  headingLevel?: 2 | 3;
  sizes?: string;
}) {
  const source = getPaperCardArtwork(paper.slug);
  const image = source && { ...source, alt: "", sizes };
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className={styles.card} data-featured={featured || undefined} data-artwork-end={artworkEnd || undefined}>
      <EditorialArtwork image={image} {...artwork} />
      <div className={styles.cardContent}>
        <PaperMeta paper={paper} />
        <Heading className={styles.cardTitle}>
          <Link href={"/papers/" + paper.slug} prefetch={false}>{paper.title}</Link>
        </Heading>
        <p className={styles.cardExcerpt}>{paper.excerpt}</p>
        <span className={styles.cardArrow} aria-hidden="true">↗</span>
      </div>
    </article>
  );
}
