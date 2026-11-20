import { getGuideAnchor, type GuidePoint } from "@/lib/paper-guides";
import styles from "@/app/research.module.css";

export function PaperGuide({ points, anchored }: { points: readonly GuidePoint[]; anchored: ReadonlySet<string> }) {
  if (!points.length) return null;
  return (
    <nav className={styles.guide} aria-labelledby="inside-paper-heading">
      <h2 id="inside-paper-heading">Inside this paper</h2>
      <ol>
        {points.map(([id, label]) => (
          <li key={id}>
            {anchored.has(id) ? <a href={`#${getGuideAnchor(id)}`}>{label}</a> : label}
          </li>
        ))}
      </ol>
    </nav>
  );
}
