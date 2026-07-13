import type { Paper } from "@/lib/papers";
import { PaperCard } from "./PaperCard";

export function RelatedPapers({ papers }: { papers: Paper[] }) {
  if (!papers.length) return null;
  return (
    <section className="related-papers" aria-labelledby="related-heading">
      <p className="eyebrow">Continue reading</p>
      <h2 id="related-heading">Related papers</h2>
      <div className="paper-list">
        {papers.map((paper) => <PaperCard key={paper.slug} paper={paper} />)}
      </div>
    </section>
  );
}
