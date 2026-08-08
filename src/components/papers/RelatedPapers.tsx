import Link from "next/link";
import type { Paper } from "@/lib/papers";
import { PaperMeta } from "./PaperMeta";

export function RelatedPapers({ papers }: { papers: Paper[] }) {
  if (!papers.length) return null;
  return (
    <section className="paper-discovery" aria-labelledby="paper-discovery-heading">
      <header className="paper-discovery-heading">
        <p className="eyebrow">Continue exploring</p>
        <h2 id="paper-discovery-heading">Follow the next line of thought.</h2>
      </header>
      <div className="paper-discovery-grid">
        {papers.map((paper) => (
          <article className="paper-discovery-card" key={paper.slug}>
            <PaperMeta paper={paper} />
            <h3>
              <Link href={`/papers/${paper.slug}`}>{paper.title}</Link>
            </h3>
            <Link
              className="paper-discovery-link"
              href={`/papers/${paper.slug}`}
              aria-label={`Read ${paper.title}`}
            >
              Read paper <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
