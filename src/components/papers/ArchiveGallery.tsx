import type { Paper } from "@/lib/papers";
import { EditorialCard } from "@/components/foundation/EditorialCard";
import styles from "@/app/editorial.module.css";

export function ArchiveGallery({ papers, featureFirst = false }: { papers: Paper[]; featureFirst?: boolean }) {
  const featured = featureFirst ? papers[0] : undefined;
  const entries = featured ? papers.slice(1) : papers;
  return (
    <>
      {featured && (
        <div className={styles.archiveFeature}>
          <EditorialCard paper={featured} featured headingLevel={2} sizes="(max-width: 48rem) 92vw, 660px" artwork={{ eager: true }} />
        </div>
      )}
      <div className={styles.gallery}>
        {entries.map((paper) => <EditorialCard key={paper.slug} paper={paper} headingLevel={2} />)}
      </div>
    </>
  );
}
