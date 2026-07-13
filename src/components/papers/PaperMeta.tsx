import { formatDate, type Paper } from "@/lib/papers";

export function PaperMeta({ paper }: { paper: Paper }) {
  return (
    <div className="paper-meta">
      <span>{paper.category}</span>
      <span>{formatDate(paper.date)}</span>
      <span>{paper.readingTime}</span>
    </div>
  );
}
