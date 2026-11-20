import Link from "next/link";
import type { getPaperConnections } from "@/lib/research";
import styles from "@/app/research.module.css";

export function RelatedPapers({ connections }: { connections: ReturnType<typeof getPaperConnections> }) {
  if (!connections.length) return null;
  return (
    <section className={styles.connections} aria-labelledby="paper-discovery-heading">
      <h2 id="paper-discovery-heading">Continue the exploration</h2>
      <ul className={styles.connectionList} role="list">
        {connections.map(({ paper, explanation, label }) => (
          <li key={paper.slug}>
            <p className={styles.eyebrow}>{label}<span>{paper.category}</span></p>
            <h3><Link href={`/papers/${paper.slug}`}>{paper.title}</Link></h3>
            <p>{explanation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
