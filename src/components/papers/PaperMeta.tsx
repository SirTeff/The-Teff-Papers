import Link from "next/link";
import { formatDate, getCategorySlug, type Paper } from "@/lib/papers";

export function PaperMeta({ paper }: { paper: Paper }) {
  return (
    <div className="paper-meta" aria-label="Paper details">
      <Link href={`/categories/${getCategorySlug(paper.category)}`}>{paper.category}</Link>
      <time dateTime={paper.date}>{formatDate(paper.date)}</time>
      <span aria-label={`Estimated reading time: ${paper.readingTime}`}>{paper.readingTime}</span>
    </div>
  );
}
