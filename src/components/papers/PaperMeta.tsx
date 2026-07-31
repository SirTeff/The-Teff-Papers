import Link from "next/link";
import { formatDate, getCategorySlug, type Paper } from "@/lib/papers";

export function PaperMeta({ paper }: { paper: Paper }) {
  return (
    <div className="paper-meta">
      <Link href={`/categories/${getCategorySlug(paper.category)}`}>{paper.category}</Link>
      <span>{formatDate(paper.date)}</span>
      <span>{paper.readingTime}</span>
    </div>
  );
}
