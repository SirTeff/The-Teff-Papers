import Link from "next/link";
import type { Paper } from "@/lib/papers";
import { PaperMeta } from "./PaperMeta";

export function PaperCard({ paper, featured = false }: { paper: Paper; featured?: boolean }) {
  return (
    <article className={`paper-card ${featured ? "paper-card--featured" : ""}`}>
      <PaperMeta paper={paper} />
      <h3>
        <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
      </h3>
      <p>{paper.excerpt}</p>
      <ul className="tag-list" aria-label="Tags">
        {paper.tags.map((tag) => <li key={tag}>{tag}</li>)}
      </ul>
    </article>
  );
}
